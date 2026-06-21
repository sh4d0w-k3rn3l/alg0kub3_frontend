import { create } from 'zustand';
import type { Course, Section, Lesson, ProgressData } from '@/types';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';

interface CourseState {
  courses: Course[];
  courseMap: Record<string, Course>;
  sections: Section[];
  lessons: Lesson[];
  progress: ProgressData | null;
  loading: boolean;
  fetchCourses: () => Promise<void>;
  fetchCourse: (slug: string) => Promise<void>;
  fetchProgress: (courseSlug: string) => Promise<void>;
  clear: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  courseMap: {},
  sections: [],
  lessons: [],
  progress: null,
  loading: false,

  fetchCourses: async () => {
    set({ loading: true });
    try {
      const res = await api.get<{ courses: Course[] } | Course[]>('/courses?limit=100', { cache: 'no-store' });
      const courses = ('courses' in res.data ? res.data.courses : (res.data as Course[]) || []).filter((c: Course) => c.lesson_count! > 0);
      const courseMap: Record<string, Course> = {};
      courses.forEach((c: Course) => { courseMap[c.slug] = c; });
      set({ courses, courseMap, loading: false });
    } catch (err) {
      handleApiError(err, 'Failed to fetch courses');
      set({ loading: false });
    }
  },

  fetchCourse: async (slug: string) => {
    try {
      const res = await api.get<{ course: Course & { sections: Section[]; lessons: Lesson[] } }>(`/courses/${slug}`);
      const course = res.data.course || res.data;
      if (course) {
        set((s) => ({
          sections: (course as Course & { sections: Section[]; lessons: Lesson[] }).sections || [],
          lessons: (course as Course & { sections: Section[]; lessons: Lesson[] }).lessons || [],
          courseMap: { ...s.courseMap, [slug]: course },
        }));
      }
    } catch { /* ignore */ }
  },

  fetchProgress: async (courseSlug: string) => {
    try {
      const res = await api.get<ProgressData>(`/progress/${courseSlug}`);
      set({ progress: res.data });
    } catch { /* ignore */ }
  },

  clear: () => set({ courses: [], courseMap: {}, sections: [], lessons: [], progress: null }),
}));
