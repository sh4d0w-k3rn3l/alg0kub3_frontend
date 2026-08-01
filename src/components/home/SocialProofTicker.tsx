'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { X, CheckCircle, BookOpen } from 'lucide-react';

interface TickerCourse {
  slug: string;
  title: string;
  lesson_count?: number;
}

/* ── Realistic mock data pools ── */
const FIRST_NAMES = [
  'Alex', 'Priya', 'Marcus', 'Yuki', 'Sarah', 'David', 'Mei',
  'Omar', 'Elena', 'James', 'Ananya', 'Carlos', 'Nora', 'Leo',
  'Zara', 'Ravi', 'Kim', 'Thomas', 'Ava', 'Hiroshi', 'Lina',
  'Ethan', 'Sofia', 'Akash', 'Maya', 'Daniel', 'Chloe', 'Ahmed',
];

const LOCATIONS = [
  'San Francisco', 'London', 'Bangalore', 'Toronto', 'Berlin',
  'New York', 'Singapore', 'Mumbai', 'Sydney', 'Tokyo',
  'Amsterdam', 'Seattle', 'Dublin', 'Hyderabad', 'Austin',
  'Paris', 'Tel Aviv', 'Stockholm', 'Seoul', 'Chicago',
];

const ACTIONS = [
  { text: 'just enrolled in', weight: 5 },
  { text: 'started learning', weight: 3 },
  { text: 'completed a lesson in', weight: 2 },
];

const TIME_LABELS = [
  '2 min ago', '5 min ago', '8 min ago', '12 min ago',
  '15 min ago', '20 min ago', '25 min ago', '30 min ago',
  '1 hour ago', 'just now', 'moments ago',
];

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickWeighted = <T extends { weight: number },>(items: T[]): T => {
  const pool = items.flatMap((i: T) => Array(i.weight).fill(i));
  return pool[Math.floor(Math.random() * pool.length)];
};

interface SocialProofNotification {
  id: number;
  name: string;
  location: string;
  action: string;
  course: string;
  courseSlug: string;
  time: string;
  avatarColor: string;
}

const SocialProofTicker = ({ courses = [] }: { courses?: TickerCourse[] }) => {
  const navigate = useRouter();
  const { isDark } = useTheme();
  const [notification, setNotification] = useState<SocialProofNotification | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);

  /* Course names to display — prefer courses with lessons */
  const coursePool = useRef<TickerCourse[]>([]);
  useEffect(() => {
    if (courses.length > 0) {
      const withLessons = courses.filter(c => (c.lesson_count ?? 0) > 0);
      coursePool.current = withLessons.length > 0 ? withLessons : courses;
    }
  }, [courses]);

  const generateNotification = useCallback(() => {
    const pool = coursePool.current;
    if (pool.length === 0) return null;
    const course = pickRandom(pool);
    const action = pickWeighted(ACTIONS);
    return {
      id: Date.now(),
      name: pickRandom(FIRST_NAMES),
      location: pickRandom(LOCATIONS),
      action: action.text,
      course: course.title,
      courseSlug: course.slug,
      time: pickRandom(TIME_LABELS),
      avatarColor: `hsl(${Math.floor(Math.random() * 360)}, 65%, ${isDark ? 45 : 40}%)`,
    };
  }, [isDark]);

  const showNext = useCallback(() => {
    if (dismissed || paused) return;

    const notif = generateNotification();
    if (!notif) return;

    setNotification(notif);
    setVisible(true);
    countRef.current += 1;

    /* Auto-hide after 4.5s */
    clearTimeout(timeoutRef.current ?? undefined);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 4500);
  }, [dismissed, paused, generateNotification]);

  useEffect(() => {
    if (dismissed) return;

    /* First notification after 6s */
    const initTimer = setTimeout(() => {
      showNext();
      /* Then every 8-12s */
      intervalRef.current = setInterval(() => {
        showNext();
      }, 8000 + Math.random() * 4000);
    }, 6000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(intervalRef.current ?? undefined);
      clearTimeout(timeoutRef.current ?? undefined);
    };
  }, [dismissed, showNext]);

  /* Stop after 15 notifications to avoid annoyance */
  useEffect(() => {
    if (countRef.current >= 15) {
      setDismissed(true);
      setVisible(false);
    }
  }, [notification]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    setVisible(false);
    clearInterval(intervalRef.current ?? undefined);
    clearTimeout(timeoutRef.current ?? undefined);
  };

  const handleClick = () => {
    if (notification?.courseSlug) {
      navigate.push(`/course/${notification.courseSlug}`);
    }
  };

  if (dismissed || !notification) return null;

  const initial = notification.name.charAt(0).toUpperCase();

  return (
    <div
      data-testid="social-proof-ticker"
      className="fixed z-50"
      style={{
        bottom: 24,
        left: 24,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onMouseEnter={() => { setPaused(true); clearTimeout(timeoutRef.current ?? undefined); }}
      onMouseLeave={() => { setPaused(false); timeoutRef.current = setTimeout(() => setVisible(false), 2000); }}
    >
      <div
        data-testid="social-proof-card"
        onClick={handleClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          borderRadius: 14,
          cursor: 'pointer',
          maxWidth: 380,
          background: isDark
            ? 'linear-gradient(135deg, rgba(22,27,34,0.97), rgba(13,17,23,0.97))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(48,54,61,0.8)' : 'rgba(228,228,231,0.9)'}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)'
            : '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
          transform: visible ? 'translateX(0) scale(1)' : 'translateX(-20px) scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Avatar */}
        <div
          data-testid="social-proof-avatar"
          style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: notification.avatarColor,
            color: '#fff', fontSize: 16, fontWeight: 700,
            boxShadow: `0 2px 8px ${notification.avatarColor}40`,
          }}
        >
          {initial}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, lineHeight: 1.45,
            color: isDark ? '#e6edf3' : '#1f2937',
          }}>
            <span style={{ fontWeight: 700 }}>{notification.name}</span>
            <span style={{ color: isDark ? '#8b949e' : '#6b7280' }}> from {notification.location} </span>
            <span style={{ color: isDark ? '#8b949e' : '#6b7280' }}>{notification.action} </span>
            <span style={{ fontWeight: 700, color: isDark ? '#22c55e' : '#16a34a' }}>{notification.course}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 3, fontSize: 11,
            color: isDark ? '#6e7681' : '#9ca3af',
          }}>
            <CheckCircle size={11} style={{ color: isDark ? '#22c55e' : '#16a34a' }} />
            <span>Verified</span>
            <span style={{ margin: '0 2px' }}>&middot;</span>
            <span>{notification.time}</span>
          </div>
        </div>

        {/* Course icon + dismiss */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            data-testid="social-proof-dismiss"
            onClick={handleDismiss}
            style={{
              width: 20, height: 20, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: isDark ? '#484f58' : '#d1d5db',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#8b949e' : '#6b7280'}
            onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#484f58' : '#d1d5db'}
            aria-label="Dismiss notifications"
          >
            <X size={14} />
          </button>
          <BookOpen size={14} style={{ color: isDark ? '#484f58' : '#d1d5db' }} />
        </div>
      </div>
    </div>
  );
};

export default SocialProofTicker;
