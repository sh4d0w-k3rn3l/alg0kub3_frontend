import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  coursesOpen: boolean;
  practiceOpen: boolean;
  moreOpen: boolean;
  notificationPanelOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCoursesOpen: (open: boolean) => void;
  setPracticeOpen: (open: boolean) => void;
  setMoreOpen: (open: boolean) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  coursesOpen: false,
  practiceOpen: false,
  moreOpen: false,
  notificationPanelOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCoursesOpen: (open) => set({ coursesOpen: open }),
  setPracticeOpen: (open) => set({ practiceOpen: open }),
  setMoreOpen: (open) => set({ moreOpen: open }),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  closeAll: () => set({ coursesOpen: false, practiceOpen: false, moreOpen: false, notificationPanelOpen: false }),
}));
