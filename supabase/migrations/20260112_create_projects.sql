-- Create Project Management System
-- Supports projects, tasks, milestones, and team assignments

-- Create project status enum
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create task status enum
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'completed', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create priority enum
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create projects table
CREATE TABLE IF NOT EXISTS kb_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- Status and priority
  status project_status DEFAULT 'planning' NOT NULL,
  priority priority_level DEFAULT 'medium' NOT NULL,

  -- Progress tracking
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Organization
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',

  -- Settings
  color VARCHAR(7) DEFAULT '#22c55e', -- Hex color for UI
  is_archived BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS kb_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES kb_projects(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Dates
  due_date DATE,

  -- Ordering
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS kb_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES kb_projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES kb_milestones(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES kb_tasks(id) ON DELETE CASCADE,

  -- Basic info
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Status and priority
  status task_status DEFAULT 'todo' NOT NULL,
  priority priority_level DEFAULT 'medium' NOT NULL,

  -- Assignment
  assignee_id UUID REFERENCES kb_authors(id) ON DELETE SET NULL,

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Effort tracking
  estimated_hours DECIMAL(6, 2),
  actual_hours DECIMAL(6, 2),

  -- Ordering
  display_order INTEGER DEFAULT 0,

  -- Labels/tags for filtering
  labels TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create task comments table (for task discussions)
CREATE TABLE IF NOT EXISTS kb_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES kb_tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES kb_authors(id) ON DELETE SET NULL,

  -- Content
  content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON kb_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON kb_projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON kb_projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON kb_projects(is_archived);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON kb_projects(due_date);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON kb_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON kb_milestones(due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON kb_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON kb_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON kb_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON kb_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON kb_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON kb_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON kb_tasks(parent_task_id);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON kb_task_comments(task_id);

-- Enable RLS
ALTER TABLE kb_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Service role has full access
CREATE POLICY "Service role projects access" ON kb_projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role milestones access" ON kb_milestones
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role tasks access" ON kb_tasks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role task_comments access" ON kb_task_comments
  FOR ALL USING (auth.role() = 'service_role');

-- Allow anon read for non-archived projects (for public dashboards if needed)
CREATE POLICY "Public read active projects" ON kb_projects
  FOR SELECT USING (is_archived = false);

CREATE POLICY "Public read milestones" ON kb_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kb_projects WHERE id = project_id AND is_archived = false)
  );

CREATE POLICY "Public read tasks" ON kb_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kb_projects WHERE id = project_id AND is_archived = false)
  );

-- Functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_milestone_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
DROP TRIGGER IF EXISTS trigger_project_updated ON kb_projects;
CREATE TRIGGER trigger_project_updated
  BEFORE UPDATE ON kb_projects
  FOR EACH ROW EXECUTE FUNCTION update_project_timestamp();

DROP TRIGGER IF EXISTS trigger_milestone_updated ON kb_milestones;
CREATE TRIGGER trigger_milestone_updated
  BEFORE UPDATE ON kb_milestones
  FOR EACH ROW EXECUTE FUNCTION update_milestone_timestamp();

DROP TRIGGER IF EXISTS trigger_task_updated ON kb_tasks;
CREATE TRIGGER trigger_task_updated
  BEFORE UPDATE ON kb_tasks
  FOR EACH ROW EXECUTE FUNCTION update_task_timestamp();

-- Function to calculate project progress based on tasks
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM kb_tasks
  WHERE project_id = p_project_id AND parent_task_id IS NULL;

  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update project progress when tasks change
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE kb_projects
  SET progress = calculate_project_progress(COALESCE(NEW.project_id, OLD.project_id))
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_progress ON kb_tasks;
CREATE TRIGGER trigger_update_project_progress
  AFTER INSERT OR UPDATE OR DELETE ON kb_tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- Function to auto-set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_task_completed ON kb_tasks;
CREATE TRIGGER trigger_task_completed
  BEFORE UPDATE ON kb_tasks
  FOR EACH ROW EXECUTE FUNCTION set_task_completed_at();

-- Function to auto-set project completed_at
CREATE OR REPLACE FUNCTION set_project_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_project_completed ON kb_projects;
CREATE TRIGGER trigger_project_completed
  BEFORE UPDATE ON kb_projects
  FOR EACH ROW EXECUTE FUNCTION set_project_completed_at();

-- Comments for documentation
COMMENT ON TABLE kb_projects IS 'Project management - main projects table';
COMMENT ON TABLE kb_milestones IS 'Project milestones for tracking major goals';
COMMENT ON TABLE kb_tasks IS 'Tasks within projects, supports subtasks via parent_task_id';
COMMENT ON TABLE kb_task_comments IS 'Discussion comments on tasks';
COMMENT ON COLUMN kb_projects.progress IS 'Auto-calculated percentage based on completed tasks';
COMMENT ON COLUMN kb_projects.metadata IS 'Flexible JSON for custom fields';
COMMENT ON COLUMN kb_tasks.estimated_hours IS 'Estimated effort in hours';
COMMENT ON COLUMN kb_tasks.actual_hours IS 'Tracked actual hours spent';
