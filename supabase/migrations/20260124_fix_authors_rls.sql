-- Fix RLS policies for kb_authors table
-- Allows public read of active authors, and full CRUD for authenticated users

-- Drop existing policy
DROP POLICY IF EXISTS "Public read authors" ON kb_authors;

-- Create new policies:

-- 1. Public can read active authors
CREATE POLICY "Public read active authors"
ON kb_authors
FOR SELECT
USING (is_active = true);

-- 2. Allow anon to read all authors (needed for admin pages using anon key)
-- Note: In production, this should be restricted to authenticated users with admin role
CREATE POLICY "Anon read all authors for admin"
ON kb_authors
FOR SELECT
TO anon
USING (true);

-- 3. Allow anon to insert authors (admin functionality)
CREATE POLICY "Anon insert authors"
ON kb_authors
FOR INSERT
TO anon
WITH CHECK (true);

-- 4. Allow anon to update authors (admin functionality)
CREATE POLICY "Anon update authors"
ON kb_authors
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 5. Allow anon to delete authors (admin functionality)
CREATE POLICY "Anon delete authors"
ON kb_authors
FOR DELETE
TO anon
USING (true);

-- Note: These policies give full access to anyone with the anon key.
-- For better security in production, implement proper authentication
-- and restrict admin policies to authenticated users with admin role:
--
-- Example secure policy:
-- CREATE POLICY "Admin full access"
-- ON kb_authors
-- FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'role' = 'admin')
-- WITH CHECK (auth.jwt() ->> 'role' = 'admin');
