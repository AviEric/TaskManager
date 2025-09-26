// Debug helper for database issues
// Add this to your browser console to check database setup

async function debugDatabase() {
    console.log('=== Database Debug Information ===');
    
    // Check if Supabase is loaded
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase not loaded');
        return;
    }
    console.log('✅ Supabase loaded');
    
    // Check database connection
    const db = new DatabaseManager();
    await db.init();
    
    console.log('Current user:', db.getCurrentUser());
    console.log('Is authenticated:', db.isAuthenticated());
    
    if (db.isAuthenticated()) {
        console.log('User ID:', db.getCurrentUser().id);
        
        // Test database connection
        try {
            const result = await db.supabase.from('tasks').select('count').limit(1);
            console.log('✅ Database connection successful');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
        }
        
        // Check RLS policies
        try {
            const { data, error } = await db.supabase.rpc('check_rls_policies');
            if (error) {
                console.log('ℹ️ RLS check function not available (this is normal)');
            }
        } catch (error) {
            console.log('ℹ️ RLS check not available (this is normal)');
        }
    } else {
        console.log('❌ User not authenticated');
    }
}

// Run debug
debugDatabase();
