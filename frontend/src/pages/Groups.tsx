import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowRight, Sparkles, MessageSquare, ShieldAlert } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  createdAt: string;
}

const Groups: React.FC = () => {
  const { apiUrl, getHeaders } = useAuth();
  
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Group states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user's joined groups
      const joinedResp = await fetch(`${apiUrl}/api/groups`, {
        headers: getHeaders(),
      });
      if (!joinedResp.ok) throw new Error('Failed to load your groups.');
      const joinedData = await joinedResp.ok ? await joinedResp.json() : [];
      setJoinedGroups(joinedData);

      // 2. Fetch all public groups
      const allResp = await fetch(`${apiUrl}/api/groups/all`, {
        headers: getHeaders(),
      });
      if (allResp.ok) {
        const allData = await allResp.json();
        setAllGroups(allData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/groups`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!response.ok) throw new Error('Failed to create group.');
      
      setNewGroupName('');
      setCreateModalOpen(false);
      fetchGroups();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to join group.');
      fetchGroups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && joinedGroups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter public groups that user has NOT joined
  const unjoinedGroups = allGroups.filter(
    (g) => !joinedGroups.some((jg) => jg.id === g.id)
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-primary">Progress Groups</h1>
          <p className="text-brandtext-secondary text-sm mt-1">Connect with friends, share activity, and push each other towards weight goals.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-white gradient-progress shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Create New Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Joined Groups */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <span>Your Circles</span>
            </h3>
            <p className="text-xs text-brandtext-secondary mt-0.5 font-medium">Click on any circle to view its leaderboard and feed.</p>
          </div>

          <div className="space-y-3">
            {joinedGroups.length > 0 ? (
              joinedGroups.map((group) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-primary/5 border border-gray-100 rounded-2xl group transition-all"
                >
                  <div>
                    <h4 className="font-bold text-sm text-brandtext-primary group-hover:text-primary transition-all">
                      {group.name}
                    </h4>
                    <p className="text-[10px] text-brandtext-secondary mt-1">
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-sm text-brandtext-secondary group-hover:text-primary transition-all">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-100 rounded-2xl text-xs text-brandtext-secondary space-y-2">
                <Users size={32} className="text-gray-300 mx-auto" />
                <p>You haven't joined any circles yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Discover public groups to join */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <span>Discover Public Circles</span>
            </h3>
            <p className="text-xs text-brandtext-secondary mt-0.5">Browse community progress groups and join immediately.</p>
          </div>

          <div className="space-y-3">
            {unjoinedGroups.length > 0 ? (
              unjoinedGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-gray-50/20 border border-gray-100 rounded-2xl"
                >
                  <div>
                    <h4 className="font-bold text-sm text-brandtext-primary">{group.name}</h4>
                    <p className="text-[10px] text-brandtext-secondary mt-1">
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Join
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-100 rounded-2xl text-xs text-brandtext-secondary space-y-1">
                <ShieldAlert size={28} className="text-gray-300 mx-auto" />
                <p>No new public circles discovered.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-gray-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-poppins text-primary mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <span>Create Progress Circle</span>
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brandtext-secondary block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weight Warriors, Team Fit"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm bg-gray-50/50"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-brandtext-secondary hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-progress disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
