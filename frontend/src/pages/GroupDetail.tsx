import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  UserPlus, 
  Trophy, 
  Flame, 
  Calendar, 
  Activity, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  bmiCategory: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  progressPercentage: number;
  streak: number;
}

interface ActivityItem {
  userName: string;
  message: string;
  timestamp: string;
}

interface GroupDetails {
  id: string;
  name: string;
  createdByName: string;
  createdAt: string;
  members: Member[];
  activityFeed: ActivityItem[];
}

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { apiUrl, getHeaders } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState<GroupDetails | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting / view state
  const [sortBy, setSortBy] = useState<'PROGRESS' | 'STREAK'>('PROGRESS');

  // Invitation state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchGroupDetails = async () => {
    try {
      // 1. Fetch group metadata & activity feed
      const detailsResp = await fetch(`${apiUrl}/api/groups/${groupId}`, {
        headers: getHeaders(),
      });
      if (!detailsResp.ok) throw new Error('Group not found.');
      const detailsData = await detailsResp.json();
      setDetails(detailsData);

      // 2. Fetch group leaderboard
      const lbResp = await fetch(`${apiUrl}/api/groups/${groupId}/leaderboard`, {
        headers: getHeaders(),
      });
      if (!lbResp.ok) throw new Error('Failed to load leaderboard details.');
      const lbData = await lbResp.json();
      setLeaderboard(lbData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      const response = await fetch(`${apiUrl}/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'User not found or already in group.');
      }

      setInviteSuccess(true);
      setInviteEmail('');
      // Refresh member lists
      fetchGroupDetails();
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <Users size={48} className="text-red-500 mx-auto" />
        <h3 className="text-lg font-bold">Group Not Found</h3>
        <p className="text-sm text-brandtext-secondary">{error || 'Something went wrong'}</p>
        <Link to="/groups" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
          <ArrowLeft size={16} />
          <span>Back to Groups</span>
        </Link>
      </div>
    );
  }

  // Sort leaderboard dynamically in frontend
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === 'STREAK') {
      return b.streak - a.streak;
    }
    return b.progressPercentage - a.progressPercentage;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <Link to="/groups" className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 mb-1">
            <ArrowLeft size={14} />
            <span>Back to Groups</span>
          </Link>
          <h1 className="text-2xl font-bold text-brandtext-primary font-poppins">{details.name}</h1>
          <p className="text-xs text-brandtext-secondary">
            Circle admin: <span className="font-semibold text-brandtext-primary">{details.createdByName}</span> • Created {new Date(details.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <button
          onClick={() => {
            setInviteModalOpen(true);
            setInviteSuccess(false);
            setInviteError(null);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-white gradient-progress shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <UserPlus size={18} />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 columns: Leaderboard */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <span>Privacy-First Leaderboard</span>
              </h3>
              <p className="text-xs text-brandtext-secondary mt-0.5">Calculated using target completion % to preserve raw weight privacy.</p>
            </div>

            {/* Toggle Sorting */}
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 self-start sm:self-auto text-xs">
              <button
                onClick={() => setSortBy('PROGRESS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sortBy === 'PROGRESS'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-brandtext-secondary hover:text-primary'
                }`}
              >
                % Progress
              </button>
              <button
                onClick={() => setSortBy('STREAK')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sortBy === 'STREAK'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-brandtext-secondary hover:text-primary'
                }`}
              >
                Logging Streak
              </button>
            </div>
          </div>

          {/* Member Ranks Stack */}
          <div className="space-y-3">
            {sortedLeaderboard.map((entry, index) => {
              const medalColor = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
              return (
                <div 
                  key={entry.userId}
                  className="flex items-center justify-between p-4 bg-gray-50/30 border border-gray-100/50 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">{medalColor}</span>
                    <div>
                      <h4 className="font-bold text-sm text-brandtext-primary">{entry.name}</h4>
                      <p className="text-[10px] text-brandtext-secondary mt-0.5 flex items-center gap-1">
                        <Flame size={12} className="text-accent" />
                        <span>{entry.streak} day logging streak</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {sortBy === 'PROGRESS' ? (
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-primary font-poppins">{entry.progressPercentage}%</span>
                        <div className="w-20 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-500" 
                            style={{ width: `${entry.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="font-poppins font-extrabold text-sm text-accent">{entry.streak} Days</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Activity feed */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-poppins font-bold text-brandtext-primary flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <span>Circle Activities</span>
            </h3>
            <p className="text-xs text-brandtext-secondary mt-0.5">Real-time dynamic feed from logged events.</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 divide-y divide-gray-50">
            {details.activityFeed && details.activityFeed.length > 0 ? (
              details.activityFeed.map((item, index) => (
                <div key={index} className="pt-3 text-xs leading-relaxed">
                  <p>
                    <span className="font-bold text-brandtext-primary">{item.userName}</span>{' '}
                    <span className="text-brandtext-secondary">{item.message}</span>
                  </p>
                  <span className="text-[9px] text-brandtext-secondary mt-1 block">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center py-12 text-xs text-brandtext-secondary">No recent events logged in this group.</p>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-gray-50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-poppins text-primary mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-primary" />
              <span>Invite to Circle</span>
            </h3>
            
            {inviteSuccess && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-xl text-green-800 text-xs flex items-center gap-2">
                <Check size={16} />
                <span>Invited successfully! Member added.</span>
              </div>
            )}

            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brandtext-secondary block mb-1">Member Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="friend@onemorekg.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm bg-gray-50/50"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-brandtext-secondary hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-progress disabled:opacity-50"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
