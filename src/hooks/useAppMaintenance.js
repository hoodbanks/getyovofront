import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/apiConfig';

export const DEFAULT_MAINTENANCE_MESSAGE = 'Maintenance ongoing.';

export async function readAppMaintenance() {
    try {
        const response = await fetch(`${API_BASE_URL}/app/status`, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        });
        if (!response.ok) return { maintenance: false, message: DEFAULT_MAINTENANCE_MESSAGE };
        const body = await response.json();
        const message = String(body?.data?.message || '').trim() || DEFAULT_MAINTENANCE_MESSAGE;
        return { maintenance: body?.data?.maintenance === true, message };
    } catch {
        return { maintenance: false, message: DEFAULT_MAINTENANCE_MESSAGE };
    }
}

export function useAppMaintenance() {
    const query = useQuery({
        queryKey: ['app-status'],
        queryFn: readAppMaintenance,
        refetchInterval: 60_000,
        refetchOnWindowFocus: true,
        retry: false,
    });
    return {
        checked: query.isFetched,
        maintenance: query.data?.maintenance === true,
        message: query.data?.message || DEFAULT_MAINTENANCE_MESSAGE,
    };
}
