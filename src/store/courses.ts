import { create } from 'zustand';
import type { Course } from '@/types';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';

interface CourseState {
  courses: Course[];
  loading: boolean;
  fetchCourses: () => Promise<void>;
  clear: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  loading: false,

  fetchCourses: async () => {
    set({ loading: true });
    try {
      const res = await api.get<{ courses: Course[] } | Course[]>('/courses?limit=100', { cache: 'no-store' });
      const courses = ('courses' in res.data ? res.data.courses : (res.data as Course[]) || []).filter((c: Course) => c.lesson_count! > 0);
      set({ courses, loading: false });
    } catch (err) {
      handleApiError(err, 'Failed to fetch courses');
      set({ loading: false });
    }
  },

  clear: () => set({ courses: [], loading: false }),
}));
