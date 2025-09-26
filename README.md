# Task Manager with Database Integration

A modern, responsive task management application with real-time database storage.

## Features

- ✅ Create, read, update, and delete tasks
- 🔍 Search and filter tasks
- 📊 Task statistics dashboard
- 🎨 Modern, responsive UI
- 💾 Real-time database storage (Supabase)
- 🔐 User authentication
- 📱 Mobile-friendly design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > API to get your project URL and anon key
4. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

Run this SQL in your Supabase SQL editor:

```sql
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
```

### 4. Run the Application

```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`.

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Custom CSS with modern design
- **Icons**: Font Awesome

## Project Structure

```
task-manager/
├── index.html          # Main HTML file
├── styles.css         # CSS styles
├── script.js          # Main JavaScript application
├── database.js        # Database operations
├── auth.js           # Authentication handling
├── package.json      # Project dependencies
└── README.md         # This file
```

## API Endpoints

The application uses Supabase's auto-generated REST API:

- `GET /tasks` - Fetch all tasks for the current user
- `POST /tasks` - Create a new task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.