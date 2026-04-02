import { create } from 'zustand';

export const useStore = create((set) => ({
    count: 0,
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setMobileMenuOpen: (value) => set({ isMobileMenuOpen: value }),
}));
