// Database configuration and operations
class DatabaseManager {
    constructor() {
        // Configuration - Replace with your Supabase details
        this.supabaseUrl = 'https://qcyvpdcapzxbuykpvfvt.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeXZwZGNhcHp4YnV5a3B2ZnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODg5ODksImV4cCI6MjA3NDQ2NDk4OX0.W2DR8nMZE1_UAI7KLxmJ5bbqawh0WuIjTq0Tk-_FN-U';
        this.supabase = null;
        this.currentUser = null;
        
        this.init();
    }

    async init() {
        // Initialize Supabase client
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        } else {
            console.error('Supabase not loaded. Please include the Supabase script.');
            return;
        }

        // Set up auth state listener
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            this.currentUser = session?.user || null;
        });

        // Check for existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            console.log('User already logged in:', this.currentUser.email);
        }
    }

    // Authentication methods
    async signUp(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
            
            if (data.user) {
                this.currentUser = data.user;
                return { success: true, user: data.user };
            }
            
            return { success: false, message: 'Check your email for verification link' };
        } catch (error) {
            console.error('Sign up error:', error.message);
            return { success: false, message: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            
            this.currentUser = data.user;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Sign in error:', error.message);
            return { success: false, message: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error.message);
            return { success: false, message: error.message };
        }
    }

    // Task CRUD operations
    async getTasks() {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.supabase
                .from('tasks')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            return { success: true, tasks: data || [] };
        } catch (error) {
            console.error('Get tasks error:', error.message);
            return { success: false, message: error.message, tasks: [] };
        }
    }

    async createTask(taskData) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            console.log('Creating task for user:', this.currentUser.id);
            console.log('Task data:', taskData);

            const task = {
                ...taskData,
                user_id: this.currentUser.id,
                created_at: new Date().toISOString(),
            };

            console.log('Final task object:', task);

            const { data, error } = await this.supabase
                .from('tasks')
                .insert([task])
                .select()
                .single();

            if (error) {
                console.error('Supabase error details:', error);
                throw error;
            }
            
            console.log('Task created successfully:', data);
            return { success: true, task: data };
        } catch (error) {
            console.error('Create task error:', error.message);
            console.error('Full error:', error);
            return { success: false, message: error.message };
        }
    }

    async updateTask(taskId, updates) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.supabase
                .from('tasks')
                .update(updates)
                .eq('id', taskId)
                .eq('user_id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;
            
            return { success: true, task: data };
        } catch (error) {
            console.error('Update task error:', error.message);
            return { success: false, message: error.message };
        }
    }

    async deleteTask(taskId) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const { error } = await this.supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Delete task error:', error.message);
            return { success: false, message: error.message };
        }
    }

    // Real-time subscription for live updates
    subscribeToTasks(callback) {
        if (!this.currentUser) {
            console.error('User not authenticated for real-time updates');
            return null;
        }

        return this.supabase
            .channel('tasks')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'tasks',
                    filter: `user_id=eq.${this.currentUser.id}`
                }, 
                callback
            )
            .subscribe();
    }

    // Utility methods
    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Set configuration (call this before init)
    setConfig(url, key) {
        this.supabaseUrl = url;
        this.supabaseKey = key;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}
