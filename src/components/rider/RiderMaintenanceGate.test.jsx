import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RiderMaintenanceGate from './RiderMaintenanceGate';

const renderGate = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/rider/login']}>
                <Routes>
                    <Route element={<RiderMaintenanceGate />}>
                        <Route path="/rider/login" element={<h1>Rider sign in</h1>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

describe('rider maintenance screen', () => {
    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('keeps the rider page when maintenance is off', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { maintenance: false, message: 'Maintenance ongoing.' } }),
        }));
        renderGate();
        expect(await screen.findByRole('heading', { name: 'Rider sign in' })).toBeTruthy();
    });

    it('does not show rider login while the first check is still running', async () => {
        let finishCheck;
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise((resolve) => {
            finishCheck = resolve;
        })));
        renderGate();
        expect(screen.queryByRole('heading', { name: 'Rider sign in' })).toBeNull();
        expect(screen.getByRole('status', { name: 'Checking the rider app' })).toBeTruthy();

        finishCheck({
            ok: true,
            json: async () => ({ success: true, data: { maintenance: true, message: 'Maintenance ongoing.' } }),
        });
        expect(await screen.findByRole('heading', { name: 'Maintenance ongoing.' })).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Rider sign in' })).toBeNull();
    });

    it('replaces the rider app with the saved message when maintenance is on', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { maintenance: true, message: 'Back at 3am.' } }),
        }));
        renderGate();
        expect(await screen.findByRole('heading', { name: 'Back at 3am.' })).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Rider sign in' })).toBeNull();
    });

    it('keeps the rider page when the status check fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        renderGate();
        await waitFor(() => expect(fetch).toHaveBeenCalled());
        expect(await screen.findByRole('heading', { name: 'Rider sign in' })).toBeTruthy();
    });
});
