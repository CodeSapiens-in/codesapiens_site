-- Blog Feature Schema for CodeSapiens
-- Run this in your Supabase SQL Editor

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id TEXT REFERENCES users(uid) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published blogs
CREATE POLICY "Anyone can read published blogs" ON blogs
  FOR SELECT USING (status = 'published');

-- Policy: Admins can read all blogs (including drafts)
CREATE POLICY "Admins can read all blogs" ON blogs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.uid = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can insert blogs
CREATE POLICY "Admins can insert blogs" ON blogs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.uid = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update blogs
CREATE POLICY "Admins can update blogs" ON blogs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.uid = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete blogs
CREATE POLICY "Admins can delete blogs" ON blogs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.uid = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on blog updates
DROP TRIGGER IF EXISTS blogs_updated_at ON blogs;
CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();
