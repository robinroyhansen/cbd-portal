-- Real-Time Research Scanner Enhancement Migration
-- Creates database schema for background job processing and real-time progress tracking

-- Main job tracking table
CREATE TABLE kb_scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN ('manual', 'cron', 'comprehensive')),
  scan_depth VARCHAR(20) NOT NULL CHECK (scan_depth IN ('quick', 'standard', 'deep', '1year', '2years', '5years', 'comprehensive')),
  selected_sources TEXT[] NOT NULL,
  custom_keywords TEXT[] DEFAULT '{}',
  total_sources INTEGER NOT NULL CHECK (total_sources > 0),
  sources_completed INTEGER DEFAULT 0 CHECK (sources_completed >= 0),
  total_items_found INTEGER DEFAULT 0 CHECK (total_items_found >= 0),
  items_added INTEGER DEFAULT 0 CHECK (items_added >= 0),
  items_skipped INTEGER DEFAULT 0 CHECK (items_skipped >= 0),
  items_rejected INTEGER DEFAULT 0 CHECK (items_rejected >= 0),
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  progress_percentage NUMERIC(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_source VARCHAR(50),
  current_search_term TEXT,
  error_message TEXT,
  estimated_duration_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  -- Ensure sources_completed doesn't exceed total_sources
  CONSTRAINT check_sources_progress CHECK (sources_completed <= total_sources),
  -- Ensure items counts are consistent
  CONSTRAINT check_items_consistency CHECK (total_items_found = items_added + items_skipped + items_rejected)
);

-- Source-level progress tracking for detailed monitoring
CREATE TABLE kb_scan_source_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES kb_scan_jobs(id) ON DELETE CASCADE,
  source_name VARCHAR(50) NOT NULL,
  search_terms TEXT[] NOT NULL,
  terms_completed INTEGER DEFAULT 0 CHECK (terms_completed >= 0),
  total_terms INTEGER NOT NULL CHECK (total_terms > 0),
  items_found INTEGER DEFAULT 0 CHECK (items_found >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure terms_completed doesn't exceed total_terms
  CONSTRAINT check_terms_progress CHECK (terms_completed <= total_terms)
);

-- Real-time progress events for detailed activity tracking
CREATE TABLE kb_scan_progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES kb_scan_jobs(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'job_started', 'source_started', 'search_started', 'item_found',
    'item_processed', 'source_completed', 'job_completed', 'job_failed'
  )),
  source_name VARCHAR(50),
  search_term TEXT,
  item_title TEXT,
  item_url TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add job_id to existing research queue table
ALTER TABLE kb_research_queue
ADD COLUMN job_id UUID REFERENCES kb_scan_jobs(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_scan_jobs_status ON kb_scan_jobs(status);
CREATE INDEX idx_scan_jobs_created_at ON kb_scan_jobs(created_at);
CREATE INDEX idx_scan_jobs_type ON kb_scan_jobs(scan_type);
CREATE INDEX idx_scan_source_progress_job_id ON kb_scan_source_progress(job_id);
CREATE INDEX idx_scan_source_progress_status ON kb_scan_source_progress(status);
CREATE INDEX idx_scan_progress_events_job_id ON kb_scan_progress_events(job_id);
CREATE INDEX idx_scan_progress_events_timestamp ON kb_scan_progress_events(timestamp);
CREATE INDEX idx_research_queue_job_id ON kb_research_queue(job_id);

-- Function to calculate and update job progress
CREATE OR REPLACE FUNCTION update_job_progress(job_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_sources_count INTEGER;
    completed_sources_count INTEGER;
    new_progress NUMERIC(5,2);
BEGIN
    -- Get source counts
    SELECT total_sources, sources_completed
    INTO total_sources_count, completed_sources_count
    FROM kb_scan_jobs
    WHERE id = job_uuid;

    -- Calculate progress percentage
    IF total_sources_count > 0 THEN
        new_progress := (completed_sources_count::numeric / total_sources_count::numeric) * 100;
    ELSE
        new_progress := 0;
    END IF;

    -- Update job with calculated progress
    UPDATE kb_scan_jobs
    SET
        progress_percentage = new_progress,
        total_items_found = items_added + items_skipped + items_rejected
    WHERE id = job_uuid;

    -- Mark job as completed if all sources are done
    IF completed_sources_count >= total_sources_count AND completed_sources_count > 0 THEN
        UPDATE kb_scan_jobs
        SET
            status = 'completed',
            completed_at = NOW(),
            progress_percentage = 100
        WHERE id = job_uuid AND status = 'running';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment item counts and update progress
CREATE OR REPLACE FUNCTION increment_job_item_count(
    job_uuid UUID,
    count_type VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
    -- Increment the specified counter
    CASE count_type
        WHEN 'added' THEN
            UPDATE kb_scan_jobs SET items_added = items_added + 1 WHERE id = job_uuid;
        WHEN 'skipped' THEN
            UPDATE kb_scan_jobs SET items_skipped = items_skipped + 1 WHERE id = job_uuid;
        WHEN 'rejected' THEN
            UPDATE kb_scan_jobs SET items_rejected = items_rejected + 1 WHERE id = job_uuid;
    END CASE;

    -- Update overall progress
    PERFORM update_job_progress(job_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to mark a source as completed
CREATE OR REPLACE FUNCTION complete_job_source(job_uuid UUID, source_name VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    -- Update the source progress
    UPDATE kb_scan_source_progress
    SET
        status = 'completed',
        completed_at = NOW()
    WHERE job_id = job_uuid AND source_name = source_name;

    -- Increment sources_completed in main job
    UPDATE kb_scan_jobs
    SET sources_completed = sources_completed + 1
    WHERE id = job_uuid;

    -- Update overall progress
    PERFORM update_job_progress(job_uuid);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-update progress when research items are added
CREATE OR REPLACE FUNCTION on_research_item_added()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if item has a job_id
    IF NEW.job_id IS NOT NULL THEN
        -- Increment the added count and update progress
        PERFORM increment_job_item_count(NEW.job_id, 'added');

        -- Log the event
        INSERT INTO kb_scan_progress_events (
            job_id,
            event_type,
            item_title,
            item_url,
            details
        ) VALUES (
            NEW.job_id,
            'item_found',
            NEW.title,
            NEW.url,
            jsonb_build_object(
                'source_site', NEW.source_site,
                'relevance_score', NEW.relevance_score,
                'relevant_topics', NEW.relevant_topics
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_research_item_added
    AFTER INSERT ON kb_research_queue
    FOR EACH ROW EXECUTE FUNCTION on_research_item_added();

-- Function to start a new scan job
CREATE OR REPLACE FUNCTION start_scan_job(
    p_scan_type VARCHAR(20),
    p_scan_depth VARCHAR(20),
    p_selected_sources TEXT[],
    p_custom_keywords TEXT[] DEFAULT '{}',
    p_created_by TEXT DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
    job_uuid UUID;
    source_name TEXT;
    estimated_duration INTEGER;
BEGIN
    -- Calculate estimated duration based on depth and sources
    estimated_duration := CASE p_scan_depth
        WHEN 'quick' THEN 2
        WHEN 'standard' THEN 5
        WHEN 'deep' THEN 15
        WHEN '1year' THEN 30
        WHEN '2years' THEN 45
        WHEN '5years' THEN 60
        WHEN 'comprehensive' THEN 90
        ELSE 10
    END * array_length(p_selected_sources, 1);

    -- Create the main job record
    INSERT INTO kb_scan_jobs (
        scan_type,
        scan_depth,
        selected_sources,
        custom_keywords,
        total_sources,
        estimated_duration_minutes,
        created_by,
        status
    ) VALUES (
        p_scan_type,
        p_scan_depth,
        p_selected_sources,
        p_custom_keywords,
        array_length(p_selected_sources, 1),
        estimated_duration,
        p_created_by,
        'queued'
    ) RETURNING id INTO job_uuid;

    -- Create source progress records for each selected source
    FOREACH source_name IN ARRAY p_selected_sources LOOP
        INSERT INTO kb_scan_source_progress (
            job_id,
            source_name,
            search_terms,
            total_terms
        ) VALUES (
            job_uuid,
            source_name,
            CASE source_name
                WHEN 'pubmed' THEN ARRAY['cannabidiol', 'CBD', 'medical cannabis', 'cannabinoids', 'endocannabinoid']
                WHEN 'clinicaltrials' THEN ARRAY['cannabidiol', 'CBD', 'cannabis', 'cannabinoids']
                WHEN 'pmc' THEN ARRAY['cannabidiol', 'CBD', 'medical cannabis']
                ELSE ARRAY['cannabidiol', 'CBD']
            END,
            CASE source_name
                WHEN 'pubmed' THEN 5
                WHEN 'clinicaltrials' THEN 4
                WHEN 'pmc' THEN 3
                ELSE 2
            END
        );
    END LOOP;

    -- Log job creation event
    INSERT INTO kb_scan_progress_events (
        job_id,
        event_type,
        details
    ) VALUES (
        job_uuid,
        'job_started',
        jsonb_build_object(
            'scan_type', p_scan_type,
            'scan_depth', p_scan_depth,
            'sources', p_selected_sources,
            'estimated_duration', estimated_duration
        )
    );

    RETURN job_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old completed jobs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_scan_jobs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete jobs older than 30 days that are completed or failed
    DELETE FROM kb_scan_jobs
    WHERE
        created_at < NOW() - INTERVAL '30 days'
        AND status IN ('completed', 'failed');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on new tables
ALTER TABLE kb_scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_scan_source_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_scan_progress_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin full access to scan jobs" ON kb_scan_jobs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to source progress" ON kb_scan_source_progress
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to progress events" ON kb_scan_progress_events
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON kb_scan_jobs TO authenticated;
GRANT ALL ON kb_scan_source_progress TO authenticated;
GRANT ALL ON kb_scan_progress_events TO authenticated;
GRANT EXECUTE ON FUNCTION update_job_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_job_item_count(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_job_source(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION start_scan_job(VARCHAR, VARCHAR, TEXT[], TEXT[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_scan_jobs() TO authenticated;

-- Add helpful comments
COMMENT ON TABLE kb_scan_jobs IS 'Tracks background research scanning jobs with real-time progress';
COMMENT ON TABLE kb_scan_source_progress IS 'Detailed progress tracking for each source within a scan job';
COMMENT ON TABLE kb_scan_progress_events IS 'Real-time event log for scan job activity';
COMMENT ON FUNCTION update_job_progress(UUID) IS 'Calculates and updates job progress percentage';
COMMENT ON FUNCTION start_scan_job(VARCHAR, VARCHAR, TEXT[], TEXT[], TEXT) IS 'Creates a new scan job with all necessary progress tracking records';