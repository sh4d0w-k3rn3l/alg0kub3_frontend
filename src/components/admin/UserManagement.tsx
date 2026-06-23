'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { showError, handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Search, ChevronLeft, ChevronRight, Loader2,
  Shield, User, Crown, Ban, CheckCircle, Mail,
} from 'lucide-react';

const ROLE_BADGES = {
  admin: { bg: '#ef444420', text: '#ef4444', label: 'Admin' },
  user: { bg: '#3b82f620', text: '#3b82f6', label: 'User' },
};

const SUB_BADGES = {
  pro: { bg: '#22c55e20', text: '#22c55e', label: 'Pro' },
  free: { bg: '#8b949e20', text: '#8b949e', label: 'Free' },
};

interface UserItem {
  user_id: string; email: string; name: string; picture?: string;
  role: string; is_active: boolean; subscription_status: string; created_at: string;
  activity?: { lessons_completed: number; quiz_attempts: number; certificates: unknown[]; flashcards_created: number; transactions: unknown[] };
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [subFilter, setSubFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const navigate = useRouter();

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (subFilter) params.append('subscription', subFilter);
      const res = await api.get<{ users: UserItem[]; total: number; total_pages: number }>(`/admin/users?${params}`, { signal });
      if (signal?.aborted) return;
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, search, roleFilter, subFilter]);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers(ac.signal);
    return () => ac.abort();
  }, [fetchUsers]);

  const viewDetail = async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get<UserItem>(`/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Record<string, unknown>) => {
    try {
      await api.put(`/admin/users/${userId}`, updates);
      fetchUsers();
      if (selectedUser?.user_id === userId) viewDetail(userId);
    } catch (err) {
      showError('Update failed: ' + (err instanceof ApiError ? err.detail : (err as Error).message));
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      await api.post(`/admin/users/${userId}/${endpoint}`);
      fetchUsers();
      if (selectedUser?.user_id === userId) viewDetail(userId);
    } catch (err) {
      showError('Failed: ' + (err instanceof ApiError ? err.detail : (err as Error).message));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 data-testid="user-management-title" className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-[#8b949e]">{total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input
              data-testid="user-search-input"
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg pl-9 pr-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
            />
          </div>
          <select
            data-testid="role-filter"
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            data-testid="subscription-filter"
            value={subFilter}
            onChange={e => { setSubFilter(e.target.value); setPage(1); }}
            className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none"
          >
            <option value="">All Plans</option>
            <option value="pro">Pro</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Users Table */}
          <div className="flex-1">
            <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 size={24} className="text-[#22c55e] animate-spin" /></div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2d333b]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">User</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: UserItem) => {
                      const role = ROLE_BADGES[u.role as keyof typeof ROLE_BADGES] || ROLE_BADGES.user;
                      const sub = SUB_BADGES[u.subscription_status as keyof typeof SUB_BADGES] || SUB_BADGES.free;
                      const active = u.is_active !== false;
                      return (
                        <tr
                          key={u.user_id}
                          data-testid={`user-row-${u.user_id}`}
                          onClick={() => viewDetail(u.user_id)}
                          className="border-b border-[#2d333b]/50 hover:bg-[#1c2128] cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {u.picture ? (
                                <img src={u.picture} alt="" className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#2d333b] flex items-center justify-center">
                                  <User size={14} className="text-[#8b949e]" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-[#c9d1d9] font-medium">{u.name || 'Unnamed'}</p>
                                <p className="text-xs text-[#484f58]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: role.bg, color: role.text }}>{role.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sub.bg, color: sub.text }}>{sub.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#8b949e]">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-3">
                            {active ? (
                              <span className="text-xs text-[#22c55e]">Active</span>
                            ) : (
                              <span className="text-xs text-[#ef4444]">Deactivated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#2d333b]">
                  <span className="text-xs text-[#8b949e]">Page {page} of {totalPages}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded text-[#8b949e] hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded text-[#8b949e] hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Detail Sidebar */}
          {selectedUser && (
            <div className="w-96 border border-[#2d333b] rounded-xl p-5 h-fit sticky top-8" style={{ backgroundColor: '#161b22' }}>
              {detailLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="text-[#22c55e] animate-spin" /></div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    {selectedUser.picture ? (
                      <img src={selectedUser.picture} alt="" className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#2d333b] flex items-center justify-center">
                        <User size={20} className="text-[#8b949e]" />
                      </div>
                    )}
                    <div>
                      <p data-testid="user-detail-name" className="text-white font-medium">{selectedUser.name || 'Unnamed'}</p>
                      <p className="text-xs text-[#8b949e] flex items-center gap-1"><Mail size={10} /> {selectedUser.email}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      data-testid="toggle-role-btn"
                      onClick={() => updateUser(selectedUser.user_id, { role: selectedUser.role === 'admin' ? 'user' : 'admin' })}
                      className="flex items-center gap-1.5 justify-center text-xs py-2 rounded-lg border border-[#2d333b] text-[#c9d1d9] hover:bg-[#1c2128] transition-colors"
                    >
                      <Shield size={12} /> {selectedUser.role === 'admin' ? 'Demote' : 'Make Admin'}
                    </button>
                    <button
                      data-testid="toggle-subscription-btn"
                      onClick={() => updateUser(selectedUser.user_id, {
                        subscription_status: selectedUser.subscription_status === 'pro' ? 'free' : 'pro',
                        ...(selectedUser.subscription_status !== 'pro' ? { subscription_expires: new Date(Date.now() + 30 * 86400000).toISOString() } : {}),
                      })}
                      className="flex items-center gap-1.5 justify-center text-xs py-2 rounded-lg border border-[#2d333b] text-[#c9d1d9] hover:bg-[#1c2128] transition-colors"
                    >
                      <Crown size={12} /> {selectedUser.subscription_status === 'pro' ? 'Downgrade' : 'Upgrade Pro'}
                    </button>
                    <button
                      data-testid="toggle-active-btn"
                      onClick={() => toggleActive(selectedUser.user_id, selectedUser.is_active !== false)}
                      className={`col-span-2 flex items-center gap-1.5 justify-center text-xs py-2 rounded-lg border transition-colors ${
                        selectedUser.is_active !== false
                          ? 'border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10'
                          : 'border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10'
                      }`}
                    >
                      {selectedUser.is_active !== false ? <><Ban size={12} /> Deactivate</> : <><CheckCircle size={12} /> Activate</>}
                    </button>
                  </div>

                  {/* Activity Stats */}
                  <div className="border-t border-[#2d333b] pt-4 space-y-2">
                    <h4 className="text-xs font-medium text-[#8b949e] mb-2">Activity</h4>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#484f58]">Lessons completed</span>
                      <span className="text-[#c9d1d9]">{selectedUser.activity?.lessons_completed || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#484f58]">Quiz attempts</span>
                      <span className="text-[#c9d1d9]">{selectedUser.activity?.quiz_attempts || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#484f58]">Certificates</span>
                      <span className="text-[#c9d1d9]">{selectedUser.activity?.certificates?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#484f58]">Flashcards</span>
                      <span className="text-[#c9d1d9]">{selectedUser.activity?.flashcards_created || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#484f58]">Transactions</span>
                      <span className="text-[#c9d1d9]">{selectedUser.activity?.transactions?.length || 0}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
