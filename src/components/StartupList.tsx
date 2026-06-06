import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Trash2, Search, Users, Calendar } from "lucide-react";
import { DashboardStats } from "./DashboardStats";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Startup {
  id: string;
  name: string;
  type: string;
  subscription_price: number | null;
  created_at: string;
  organization_members?: { id: string }[];
}

// Removed the refreshTrigger prop entirely
export function StartupList() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Removed refreshTrigger from the queryKey
  const { data: startups = [], isLoading } = useQuery({
    queryKey: ["organizations"], 
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*, organization_members(id)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Startup[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("organizations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: () => {
      alert("Failed to delete. Please check your Supabase RLS policies.");
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault(); 
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredStartups = startups.filter((startup) =>
    startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    startup.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="mt-8 text-center text-slate-500 dark:text-slate-400">Loading startups...</div>;
  }

  return (
    <div className="mt-8 mb-20">
      {startups.length > 0 && <DashboardStats startups={startups} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Your Startups</h3>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {filteredStartups.length === 0 ? (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <p className="text-slate-600 dark:text-slate-400">
            {searchQuery 
              ? `No startups found matching "${searchQuery}"` 
              : "No startups found. Add one above!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStartups.map((startup) => {
            const memberCount = startup.organization_members?.length || 0;
            const formattedDate = new Date(startup.created_at).toLocaleDateString(undefined, { 
              month: 'short', day: 'numeric', year: 'numeric' 
            });

            return (
              <Link 
                to={`/startup/${startup.id}`}
                key={startup.id} 
                className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex justify-between items-center hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{startup.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                      {startup.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:flex sm:flex-col sm:items-end gap-1">
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formattedDate}
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-900 dark:text-white">
                      <Users className="w-4 h-4 mr-1 text-indigo-500" />
                      {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(e, startup.id, startup.name)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                    aria-label="Delete startup"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}

