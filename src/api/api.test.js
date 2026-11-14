import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { API_BASE_URL } from '../config/apiConfig';

const mocks = vi.hoisted(() => ({ state: {}, unauthorized: vi.fn(), disabled: vi.fn() }));

vi.mock('../store/useAuthStore', () => ({ useAuthStore: { getState: () => mocks.state } }));
vi.mock('../utils/handleUnauthorizedSession', () => ({ handleUnauthorizedAdminSession: mocks.unauthorized, handleDisabledAdminAccountSession: mocks.disabled }));

const response = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
});

const refreshSuccess = { success: true, data: { accessToken: 'fresh-access-token', refreshToken: 'existing-refresh-token' } };

beforeEach(() => {
    mocks.state = {
        accessToken: 'expired-access-token',
        refreshToken: 'existing-refresh-token',
        superAdmin: { id: 'admin-test-id' },
        rider: null,
        setAccessToken: (accessToken) => { mocks.state.accessToken = accessToken; },
        logout: vi.fn(),
    };
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => vi.unstubAllGlobals());

describe('Super Admin access-token refresh', () => {
    it('clears the active session only for an explicit disabled-account 403, not a generic forbidden response', async () => {
        fetch.mockResolvedValueOnce(response(403, { success: false, error: { code: 'SUPER_ADMIN_ACCOUNT_DISABLED', message: 'This Super Admin account is disabled.' } }));
        await expect(api.get('/superadmin/orders', 'admin-token')).rejects.toMatchObject({ status: 403, code: 'SUPER_ADMIN_ACCOUNT_DISABLED' });
        expect(mocks.disabled).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledTimes(1);

        mocks.disabled.mockClear();
        fetch.mockResolvedValueOnce(response(403, { success: false, error: { message: 'Permission denied.' } }));
        await expect(api.get('/superadmin/orders', 'admin-token')).rejects.toMatchObject({ status: 403, message: 'Permission denied.' });
        expect(mocks.disabled).not.toHaveBeenCalled();
    });

    it('does not retry a disabled-account 403 from login', async () => {
        fetch.mockResolvedValueOnce(response(403, { success: false, error: { code: 'SUPER_ADMIN_DISABLED', message: 'Account disabled.' } }));
        await expect(api.post('/superadmin/auth/login', { email: 'admin@example.com', password: 'secret' })).rejects.toMatchObject({ status: 403 });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(mocks.disabled).not.toHaveBeenCalled();
    });

    it('sends dashboard GET to the configured API base URL with the admin bearer token', async () => {
        fetch.mockResolvedValueOnce(response(200, { success: true, data: { summary: {} } }));

        await api.get('/superadmin/dashboard?page=1&limit=20', 'dashboard-admin-token');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe(`${API_BASE_URL}/superadmin/dashboard?page=1&limit=20`);
        expect(fetch.mock.calls[0][1].headers).toMatchObject({
            Accept: 'application/json',
            Authorization: 'Bearer dashboard-admin-token',
        });
        expect(fetch.mock.calls[0][1].cache).toBe('no-store');
    });

    it('bypasses browser conditional caching for Vendor Wallet reads to avoid bodyless 304 data', async () => {
        fetch.mockResolvedValueOnce(response(200, { success: true, data: { currency: 'NGN' } }));

        await api.get('/superadmin/vendor-wallet/summary', 'wallet-admin-token');

        expect(fetch.mock.calls[0][1].cache).toBe('no-store');
    });

    it('sends public admin login without a saved stale bearer token', async () => {
        fetch.mockResolvedValueOnce(response(200, {
            success: true,
            data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' },
        }));

        await api.post('/superadmin/auth/login', { email: 'admin@example.com', password: 'secret' });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it('sends Super Admin email verification and resend without a saved bearer token', async () => {
        fetch.mockResolvedValueOnce(response(200, { success: true, message: 'Email verified successfully! You can now log in.', data: null }));
        await api.post('/superadmin/auth/verify-otp', { email: 'kai@example.com', otp: '012345' }, 'stale-token');
        expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: 'kai@example.com', otp: '012345' });

        fetch.mockResolvedValueOnce({
            ok: false,
            status: 429,
            headers: { get: (name) => ({ 'retry-after': '60', 'ratelimit-reset': '120' }[String(name).toLowerCase()] || null) },
            json: async () => ({ success: false, error: { message: 'Please try again in 10 minutes' } }),
        });
        await expect(api.post('/superadmin/auth/resend-otp', { email: 'kai@example.com' }, 'stale-token')).rejects.toMatchObject({
            status: 429,
            message: 'Please try again in 10 minutes',
            retryAfter: '60',
            rateLimitReset: '120',
        });
        expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined();
        expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ email: 'kai@example.com' });
        expect(mocks.unauthorized).not.toHaveBeenCalled();
        expect(mocks.disabled).not.toHaveBeenCalled();
    });

    it('does not refresh a Super Admin session when public email verification returns 401', async () => {
        fetch.mockResolvedValueOnce(response(401, { success: false, error: { message: 'Unauthorized' } }));
        await expect(api.post('/superadmin/auth/verify-otp', { email: 'kai@example.com', otp: '012345' })).rejects.toMatchObject({ status: 401 });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(mocks.unauthorized).not.toHaveBeenCalled();
    });

    it('sends the withdrawal status endpoint as an authenticated POST with the idempotency key in JSON', async () => {
        fetch.mockResolvedValueOnce(response(200, { success: true, message: 'Updated.', data: {} }));
        const body = { status: 'COMPLETED', idempotencyKey: 'stable-retry-key' };
        await api.post('/superadmin/withdrawals/withdrawal-1/status', body, 'admin-token');
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe(`${API_BASE_URL}/superadmin/withdrawals/withdrawal-1/status`);
        expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'POST', headers: { Authorization: 'Bearer admin-token' } });
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(body);
    });

    it('marks an unreadable HTTP response separately from a fetch failure', async () => {
        fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw new SyntaxError('invalid JSON'); } });
        await expect(api.post('/superadmin/withdrawals/withdrawal-1/status', { status: 'COMPLETED', idempotencyKey: 'stable-key' }, 'admin-token'))
            .rejects.toMatchObject({ status: 200, responseReceived: true, message: 'The server returned an unreadable response.' });

        fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
        await expect(api.post('/superadmin/withdrawals/withdrawal-1/status', { status: 'COMPLETED', idempotencyKey: 'stable-key' }, 'admin-token'))
            .rejects.toMatchObject({ message: 'Failed to fetch', transportError: true });
    });

    it('does not try to refresh an existing session when public login returns 401', async () => {
        fetch.mockResolvedValueOnce(response(401, { success: false, error: { message: 'No headers found' } }));

        await expect(api.post('/superadmin/auth/login', { email: 'admin@example.com', password: 'secret' }))
            .rejects.toMatchObject({ status: 401, message: 'No headers found' });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it('refreshes with the saved refresh token and retries once using the new access token', async () => {
        fetch
            .mockResolvedValueOnce(response(401, { message: 'Unauthorized' }))
            .mockResolvedValueOnce(response(200, refreshSuccess))
            .mockResolvedValueOnce(response(200, { success: true, data: { result: 'loaded' } }));

        const result = await api.get('/superadmin/users', 'expired-access-token');

        expect(result.data.result).toBe('loaded');
        expect(fetch).toHaveBeenCalledTimes(3);
        const refreshRequest = fetch.mock.calls[1];
        expect(refreshRequest[0]).toContain('/superadmin/auth/refresh');
        expect(JSON.parse(refreshRequest[1].body)).toEqual({ refreshToken: 'existing-refresh-token' });
        expect(fetch.mock.calls[2][1].headers.Authorization).toBe('Bearer fresh-access-token');
        expect(mocks.state.accessToken).toBe('fresh-access-token');
        expect(mocks.state.refreshToken).toBe('existing-refresh-token');
    });

    it('shares one refresh request across simultaneous expired-token requests', async () => {
        let resolveRefresh;
        let refreshStarted;
        const waitingForRefresh = new Promise((resolve) => { refreshStarted = resolve; });
        fetch.mockImplementation((url, options) => {
            if (url.includes('/superadmin/auth/refresh')) {
                refreshStarted();
                return new Promise((resolve) => { resolveRefresh = () => resolve(response(200, refreshSuccess)); });
            }
            if (options.headers.Authorization === 'Bearer expired-access-token') {
                return Promise.resolve(response(401, { message: 'Unauthorized' }));
            }
            return Promise.resolve(response(200, { success: true, data: { loaded: true } }));
        });

        const firstRequest = api.get('/superadmin/users', 'expired-access-token');
        const secondRequest = api.get('/superadmin/orders', 'expired-access-token');
        await waitingForRefresh;
        expect(fetch.mock.calls.filter(([url]) => url.includes('/superadmin/auth/refresh'))).toHaveLength(1);
        resolveRefresh();

        await expect(Promise.all([firstRequest, secondRequest])).resolves.toHaveLength(2);
        expect(fetch).toHaveBeenCalledTimes(5);
    });

    it('logs out on a refresh 401 and does not retry the original request', async () => {
        fetch
            .mockResolvedValueOnce(response(401, { message: 'Unauthorized' }))
            .mockResolvedValueOnce(response(401, { message: 'Refresh token expired' }));

        await expect(api.get('/superadmin/users', 'expired-access-token')).rejects.toMatchObject({ status: 401 });
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(mocks.unauthorized).toHaveBeenCalledWith('/superadmin/auth/refresh');
    });

    it('logs out after the one retry also returns 401 without refreshing again', async () => {
        fetch
            .mockResolvedValueOnce(response(401, { message: 'Unauthorized' }))
            .mockResolvedValueOnce(response(200, refreshSuccess))
            .mockResolvedValueOnce(response(401, { message: 'Still unauthorized' }));

        await expect(api.get('/superadmin/users', 'expired-access-token')).rejects.toMatchObject({ status: 401 });
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(mocks.unauthorized).toHaveBeenCalledWith('/superadmin/users');
    });
});
