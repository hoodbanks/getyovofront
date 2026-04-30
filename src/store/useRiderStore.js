import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useRiderStore = create(
    persist(
        (set) => ({
            isOnline: false,
            activeOrdersCount: 0,
            deliveredOrdersCount: 0,

            setOnline: (value) => set({ isOnline: value }),
            setCounts: (data) => set({
                activeOrdersCount: data.activeOrdersCount ?? 0,
                deliveredOrdersCount: data.deliveredOrdersCount ?? 0,
            }),
        }),
        {
            name: 'getyovo-rider',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
