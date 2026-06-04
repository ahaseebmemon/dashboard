import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // <-- We added this
import { supabase } from "../lib/supabase";

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

  if (loading) {
    return <div className="mt-8 text-center text-slate-500">Loading startups...</div>;
  }

  if (startups.length === 0) {
    return (
      <div className="mt-8 text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-600">No startups found. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">Your Startups</h3>
      <div className="grid gap-4">
        {startups.map((startup) => (
          // We changed this div to a Link so it can be clicked!
          <Link 
            to={`/startup/${startup.id}`}
            key={startup.id} 
            className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex justify-between items-center hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div>
              <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{startup.name}</h4>
              <p className="text-sm text-slate-500">{startup.type}</p>
            </div>
            {startup.subscription_price !== null && (
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Price</span>
                <p className="font-medium text-slate-900">${startup.subscription_price}/mo</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

