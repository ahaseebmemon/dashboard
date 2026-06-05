import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ModeToggle } from './ModeToggle'; // <-- 1. Added the import here

export function DashboardLayout() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // Check if a user is currently logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no user, kick them back to the login screen
        navigate('/login');
      } else {
        // If logged in, save their email to show in the navbar
        setUserEmail(session.user.email || '');
      }
      setLoading(false);
    };
    
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Show a simple loading screen while checking ID
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">Loading security...</div>;

  return (
    // Added dark:bg-slate-900 so the background changes color
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Tech Incubator Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-90">{userEmail}</span>
          
          {/* 2. Added the toggle button right here! */}
          <ModeToggle /> 
          
          <button 
            onClick={handleSignOut}
            className="bg-indigo-800 hover:bg-indigo-900 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto text-slate-900 dark:text-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
