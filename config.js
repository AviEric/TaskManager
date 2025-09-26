// Configuration file for Supabase setup
// Replace these values with your actual Supabase project details

const SUPABASE_CONFIG = {
    // Get these from your Supabase project settings > API
    url: 'YOUR_SUPABASE_PROJECT_URL',  // e.g., 'https://your-project.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY'  // Your public anon key
};

// Database schema setup (run this in Supabase SQL editor)
const DATABASE_SCHEMA = `
-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  category TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
`;

// Instructions for setup:
/*
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Settings > API to get your project URL and anon key
4. Replace the values in SUPABASE_CONFIG above
5. Run the DATABASE_SCHEMA SQL in your Supabase SQL editor
6. Update database.js with your configuration
7. Run: npm install
8. Run: npm run dev
*/

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, DATABASE_SCHEMA };
}
