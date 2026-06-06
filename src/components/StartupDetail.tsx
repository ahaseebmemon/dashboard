import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Member {
  id: string;
  email: string;
  role: string;
  status: string;
}

export function StartupDetail() {
  const { id } = useParams();
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [id]);

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', id);

      if (error) throw error;
      if (data) setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteStatus(null);

    try {
      // 1. Ensure the user is logged in before calling the function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      // 2. Call the Edge Function using the Supabase SDK
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { 
          email: email, 
          organization_id: id 
        }
      });

      // 3. Handle errors returned from the Edge Function
      if (error) throw new Error(error.message || "Failed to invite");
      if (data?.error) throw new Error(data.error);

      // 4. Handle success
      setInviteStatus({ type: 'success', message: `Successfully invited ${email}` });
      setEmail(''); 
      fetchMembers(); // Refresh the list to show the newly invited member
      
    } catch (error: any) {
      setInviteStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link to="/" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Startup Workspace</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Managing organization ID: {id}</p>
        
        <div className="mb-10 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Invite Team Member</h3>
          <form onSubmit={handleInvite} className="flex gap-4">
            <Input 
              type="email" 
              placeholder="colleague@startup.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white dark:bg-slate-900 dark:text-white dark:border-slate-600"
            />
            <Button type="submit">Send Invite</Button>
          </form>
          {inviteStatus && (
            <p className={`mt-3 text-sm ${inviteStatus.type === 'error' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {inviteStatus.message}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Team</h3>
          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 italic">No members found. Invite someone above!</p>
          ) : (
            <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden transition-colors">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {members.map((member) => (
                    <tr key={member.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{member.email}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 capitalize">{member.role}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-900/50">
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

