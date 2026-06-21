'use client';
import { motion } from 'framer-motion';
import { BookOpen, Star, Lock, CheckCircle } from 'lucide-react';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';
import type { Course } from '@/types';

const DIFF_COLORS: Record<string, string> = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444' };

interface CourseNodeProps {
  course: Course;
  trackColor: string;
  difficulty: string;
  status: string;
  onClick: (slug: string) => void;
  t: Record<string, string>;
  isDark: boolean;
}

const CourseNode = ({ course, trackColor, difficulty, status, onClick, t, isDark }: CourseNodeProps) => {
  const Icon = COURSE_ICONS[course.slug] || BookOpen;
  const accent = COURSE_COLORS[course.slug] || trackColor;
  const sp = course.social_proof || {};
  const isComplete = status === 'completed';
  const isLocked = status === 'locked';

  return (
    <motion.button
      data-testid={`curriculum-node-${course.slug}`}
      whileHover={{ scale: isLocked ? 1 : 1.03, y: isLocked ? 0 : -2 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      onClick={() => !isLocked && onClick(course.slug)}
      className="relative rounded-xl border text-left transition-all duration-200 w-full"
      style={{
        backgroundColor: t.surface,
        borderColor: isComplete ? '#22c55e40' : isLocked ? t.border : accent + '30',
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        boxShadow: isComplete ? `0 0 20px rgba(34,197,94,0.08)` : 'none',
      }}
    >
      {isComplete && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center z-10">
          <CheckCircle size={12} className="text-white" />
        </div>
      )}
      {isLocked && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: t.textMut }}>
          <Lock size={10} className="text-white" />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + '15' }}>
            <Icon size={18} style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold leading-tight mb-1 line-clamp-2" style={{ color: t.text }}>{course.title}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ backgroundColor: DIFF_COLORS[difficulty] + '15', color: DIFF_COLORS[difficulty] }}>
                {difficulty}
              </span>
              <span className="text-[10px]" style={{ color: t.textMut }}>{course.lesson_count} lessons</span>
            </div>
            {(sp.rating ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Star size={10} fill="#f59e0b" stroke="#f59e0b" />
                <span className="text-[10px] font-semibold" style={{ color: t.textSec }}>{sp.rating}</span>
                {(sp.enrollments ?? 0) > 0 && (
                  <span className="text-[10px]" style={{ color: t.textMut }}>
                    {(sp.enrollments ?? 0) >= 1000 ? `${((sp.enrollments ?? 0)/1000).toFixed(1)}k` : sp.enrollments}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export { DIFF_COLORS };
export default CourseNode;
