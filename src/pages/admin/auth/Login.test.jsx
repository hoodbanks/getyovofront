import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import VerifyEmail from './VerifyEmail';
import api from '../../../api/api';

const mocks = vi.hoisted(() => ({ setAuth: vi.fn() }));

vi.mock('../../../api/api', () => ({ default: { post: vi.fn() } }));
vi.mock('../../../store/useAuthStore', () => ({
    useAuthStore: () => ({ setAuth: mocks.setAuth, isAuthenticated: false, superAdmin: null }),
}));

const renderLogin = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/admin/login']}>
                <Routes>
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin/verify-email" element={<VerifyEmail />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

describe('Super Admin login verification gate', () => {
    afterEach(() => {
        cleanup();
        sessionStorage.clear();
        mocks.setAuth.mockClear();
    });

    it('keeps an unverified account signed out and offers email verification', async () => {
        api.post.mockRejectedValueOnce(Object.assign(new Error('Please verify your email before logging in.'), { status: 403 }));
        const user = userEvent.setup();
        renderLogin();
        await user.type(screen.getByPlaceholderText('e.g. johndoe@example.com'), 'kai@example.com');
        await user.type(screen.getByPlaceholderText('•••••'), 'ValidPass1!');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));
        expect(await screen.findByText('Please verify your email before logging in.')).toBeTruthy();
        expect(mocks.setAuth).not.toHaveBeenCalled();
        await user.click(screen.getByRole('link', { name: 'Verify this email' }));
        expect(await screen.findByRole('heading', { name: 'Verify Super Admin email' })).toBeTruthy();
        expect(screen.getByLabelText('Email').value).toBe('kai@example.com');
        expect(sessionStorage.getItem('getyovo.superadmin.verifyEmail')).toBe('kai@example.com');
    });

    it('does not send a disabled account to email verification', async () => {
        api.post.mockRejectedValueOnce(Object.assign(new Error('This Super Admin account has been disabled. Contact another Super Admin.'), { status: 403 }));
        const user = userEvent.setup();
        renderLogin();
        await user.type(screen.getByPlaceholderText('e.g. johndoe@example.com'), 'kai@example.com');
        await user.type(screen.getByPlaceholderText('•••••'), 'ValidPass1!');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));
        expect(await screen.findByText(/has been disabled/)).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Verify this email' })).toBeNull();
        expect(mocks.setAuth).not.toHaveBeenCalled();
    });
});
