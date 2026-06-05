import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Trash2 } from "lucide-react";

interface Startup {
  id: string;
  name: string;
  type: string;
  subscription_price: number | null;
}

export function StartupList() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStartups();
  }, []);

  async function fetchStartups() {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setStartups(data);
    } catch (error) {
      console.error("Error fetching startups:", error);
    } finally {
      setLoading(false);
    }
  }

  // The new delete function
  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault(); // This stops the <Link> from navigating to the details page!
    
    // Safety check so the admin doesn't accidentally delete one
    if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Failed to delete. Please check your Supabase RLS policies.");
        throw error;
      }
      
      // Instantly remove it from the screen without reloading the page
      setStartups(startups.filter((startup) => startup.id !== id));
    } catch (error) {
      console.error("Error deleting startup:", error);
    }
  };

  if (loading) {
    return <div className="mt-8 text-center text-slate-500 dark:text-slate-400">Loading startups...</div>;
  }

  if (startups.length === 0) {
    return (
      <div className="mt-8 text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
        <p className="text-slate-600 dark:text-slate-400">No startups found. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white transition-colors">Your Startups</h3>
      <div className="grid gap-4">
        {startups.map((startup) => (
          <Link 
            to={`/startup/${startup.id}`}
            key={startup.id} 
            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex justify-between items-center hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{startup.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{startup.type}</p>
            </div>
            
            {/* Added a flex container to group the price and delete button together */}
            <div className="flex items-center gap-6">
              {startup.subscription_price !== null && (
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</span>
                  <p className="font-medium text-slate-900 dark:text-white">${startup.subscription_price}/mo</p>
                </div>
              )}
              
              {/* The Delete Button */}
              <button
                onClick={(e) => handleDelete(e, startup.id, startup.name)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                aria-label="Delete startup"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

