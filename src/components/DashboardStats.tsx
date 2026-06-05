import { Building2, DollarSign, Activity } from "lucide-react";

interface Startup {
  id: string;
  name: string;
  type: string;
  subscription_price: number | null;
}

interface DashboardStatsProps {
  startups: Startup[];
}

export function DashboardStats({ startups }: DashboardStatsProps) {
  // 1. Aggregation: Count Total Organizations
  const totalStartups = startups.length;

  // 2. Aggregation: Calculate Total Revenue
  const totalRevenue = startups.reduce((sum, startup) => {
    return sum + (startup.subscription_price || 0);
  }, 0);

  // 3. Aggregation: Find the Most Profitable Category (Revenue)
  const categoryRevenue = startups.reduce((acc, startup) => {
    acc[startup.type] = (acc[startup.type] || 0) + (startup.subscription_price || 0);
    return acc;
  }, {} as Record<string, number>);

  const topType = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Organizations</h4>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-md">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{totalStartups}</p>
      </div>

      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Monthly Revenue</h4>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-md">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">${totalRevenue}</p>
      </div>

      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Category (Revenue)</h4>
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-md">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{topType}</p>
      </div>
    </div>
  );
}

