import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderSettings = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

describe('maintenance mode row', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('opens the message box from the row and leaves the switch as the on/off control', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: [] });
        api.patch.mockResolvedValue({ message: 'Maintenance updated' });
        renderSettings();

        await user.click(await screen.findByRole('heading', { name: 'Maintenance mode' }));
        expect(screen.getByRole('heading', { name: 'Maintenance Mode' })).toBeTruthy();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByRole('heading', { name: 'Maintenance Mode' })).toBeNull();

        await user.click(screen.getByText('Enable this while performing system updates'));
        expect(screen.getByRole('heading', { name: 'Maintenance Mode' })).toBeTruthy();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await user.click(screen.getByRole('button', { name: 'Maintenance mode' }));
        expect(screen.queryByRole('heading', { name: 'Maintenance Mode' })).toBeNull();
        expect(api.patch).toHaveBeenCalledWith('/superadmin/settings/maintenance', {
            enabled: true,
            message: 'Maintenance ongoing.',
        }, 'admin-token');
    });

    it('saves the app version without stopping old apps until the switch is on', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: [] });
        api.patch.mockResolvedValue({ message: 'App update rule saved' });
        renderSettings();

        await user.click(await screen.findByRole('button', { name: 'User App Settings' }));
        await user.click(screen.getByRole('heading', { name: 'Require app update' }));
        await user.clear(screen.getByLabelText('Oldest allowed version'));
        await user.type(screen.getByLabelText('Oldest allowed version'), '1.1.0');
        await user.click(screen.getByRole('button', { name: 'Done' }));

        expect(api.patch).toHaveBeenCalledWith('/superadmin/settings/app-update', {
            enabled: false,
            minVersion: '1.1.0',
        }, 'admin-token');
    });
});
