'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, CheckCheck, MessageCircle, Award, Flame, Megaphone, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface NotifIconConfig {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}

const NOTIF_ICONS: Record<string, NotifIconConfig> = {
  reply: { icon: MessageCircle, color: '#3b82f6' },
  announcement: { icon: Megaphone, color: '#f59e0b' },
  streak: { icon: Flame, color: '#ef4444' },
  achievement: { icon: Award, color: '#8b5cf6' },
  default: { icon: Bell, color: '#22c55e' },
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link?: string;
}

const timeAgo = (dateStr: string): string => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const NotificationBell = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const authHeaders = undefined;

  const fetchUnread = useCallback(async (signal?: AbortSignal) => {
    if (!user) return;
    try {
      const res = await api.get<{ unread: number }>('/notifications/unread-count', { headers: authHeaders, signal });
      if (signal?.aborted) return;
      setUnread(res.data.unread || 0);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
    }
  }, [user]);

  const fetchNotifications = useCallback(async (signal?: AbortSignal) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get<{ notifications: Notification[]; unread: number }>('/notifications?limit=15', { headers: authHeaders, signal });
      if (signal?.aborted) return;
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const ac = new AbortController();
    fetchUnread(ac.signal);
    const interval = setInterval(() => fetchUnread(ac.signal), 30000);
    return () => { clearInterval(interval); ac.abort(); };
  }, [fetchUnread]);

  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    fetchNotifications(ac.signal);
    return () => ac.abort();
  }, [open, fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.post(`/notifications/read/${id}`, {}, { headers: authHeaders });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all', {}, { headers: authHeaders });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch { /* ignore */ }
  };

  const handleClick = (notif: Notification) => {
    if (!notif.read) handleMarkRead(notif.id);
    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  };

  if (!user) return null;

  return (
    <div ref={panelRef} className="relative">
      <button
        data-testid="notification-bell"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: colors.textSecondary }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = colors.hoverBg}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full text-white"
            style={{ backgroundColor: '#ef4444' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          data-testid="notification-panel"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: colors.bgSecondary || colors.bg, borderColor: colors.border }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
            <h3 className="text-sm font-bold" style={{ color: colors.text }}>Notifications</h3>
            {unread > 0 && (
              <button
                data-testid="mark-all-read"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                style={{ color: '#22c55e' }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin" style={{ color: '#22c55e' }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={24} className="mx-auto mb-2" style={{ color: colors.textMuted }} />
                <p className="text-sm" style={{ color: colors.textMuted }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const config = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
                const Icon = config.icon;
                return (
                  <button
                    key={n.id}
                    data-testid={`notif-${n.id}`}
                    onClick={() => handleClick(n)}
                    className="w-full text-left px-4 py-3 flex gap-3 transition-colors border-b"
                    style={{
                      borderColor: colors.border + '40',
                      backgroundColor: n.read ? 'transparent' : (colors.hoverBg || '#22c55e08'),
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = colors.hoverBg || '#ffffff08'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : (colors.hoverBg || '#22c55e08')}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config.color}15` }}>
                      <Icon size={14} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? '' : 'font-semibold'}`} style={{ color: colors.text }}>{n.title}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: colors.textMuted }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#22c55e' }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
