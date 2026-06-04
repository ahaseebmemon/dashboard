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
      // 1. Get the admin's current token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      // 2. Send the request to our Edge Function Courier!
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ email, organization_id: id })
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to invite");

      setInviteStatus({ type: 'success', message: `Successfully invited ${email}` });
      setEmail(''); // clear the input
      fetchMembers(); // refresh the list
    } catch (error: any) {
      setInviteStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link to="/" className="text-slate-500 hover:text-slate-900 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Startup Workspace</h2>
        <p className="text-slate-500 text-sm mb-8">Managing organization ID: {id}</p>
        
        {/* The Invite Form */}
        <div className="mb-10 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
          <form onSubmit={handleInvite} className="flex gap-4">
            <Input 
              type="email" 
              placeholder="colleague@startup.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white"
            />
            <Button type="submit">Send Invite</Button>
          </form>
          {inviteStatus && (
            <p className={`mt-3 text-sm ${inviteStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
              {inviteStatus.message}
            </p>
          )}
        </div>

        {/* The Member List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Team</h3>
          {loading ? (
            <p className="text-slate-500">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-slate-500 italic">No members found. Invite someone above!</p>
          ) : (
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {members.map((member) => (
                    <tr key={member.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-900">{member.email}</td>
                      <td className="px-4 py-3 text-slate-500 capitalize">{member.role}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
