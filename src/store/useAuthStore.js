import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            superAdmin: null,
            rider: null,
            isAuthenticated: false,

            setAuth: (data) => set({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                superAdmin: data.superAdmin || null,
                rider: data.rider || null,
                isAuthenticated: true,
            }),

            logout: () => set({
                accessToken: null,
                refreshToken: null,
                superAdmin: null,
                rider: null,
                isAuthenticated: false,
            }),
        }),
        {
            name: 'getyovo-auth',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
