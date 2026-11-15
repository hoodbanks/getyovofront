import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ActiveOrder from './ActiveOrder';
import api from '../../../api/api';

vi.mock('../../../api/api', () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../../../store/useAuthStore', () => ({
    useAuthStore: (selector) => selector({ accessToken: 'rider-token', rider: { name: 'Ada Rider' } }),
}));

vi.mock('../../../store/useRiderStore', () => ({
    useRiderStore: (selector) => selector({ isOnline: true, activeOrdersCount: 1, deliveredOrdersCount: 0 }),
}));

const order = (status) => ({
    orderId: 'order-1',
    status,
    code: 'GY1',
    shopType: 'Restaurant',
    vendorStoreName: 'Solid Foods',
    storeAddress: '1 Market Road',
    itemsString: '1x Rice',
    customerName: 'Kai Example',
    customerPhone: '08000000000',
    deliveryAddress: '2 Example Close',
    totalAmount: 3000,
});

const renderOrder = (status) => {
    api.get.mockImplementation((path) => {
        if (path === '/rider/orders/order-1') return Promise.resolve({ data: order(status) });
        return Promise.resolve({ data: { data: [order(status)] } });
    });
    return render(
        <MemoryRouter initialEntries={['/rider/app/active-order/order-1']}>
            <Routes>
                <Route path="/rider/app/active-order/:orderId" element={<ActiveOrder />} />
            </Routes>
        </MemoryRouter>,
    );
};

describe('rider active order steps', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('asks the rider to mark out for delivery after accept, before the delivery code', async () => {
        renderOrder('RIDER_ACCEPTED');
        expect(await screen.findByRole('button', { name: 'Mark out for delivery' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Enter delivery code' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Navigate to customer' })).toBeNull();
    });

    it('shows the customer trip only after the order is out for delivery', async () => {
        renderOrder('OUT_FOR_DELIVERY');
        expect(await screen.findByRole('button', { name: 'Enter delivery code' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Navigate to customer' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Mark out for delivery' })).toBeNull();
    });

    it('sends the customer code without spaces and keeps a leading zero', async () => {
        api.post.mockResolvedValue({ data: { orderId: 'order-1' } });
        renderOrder('OUT_FOR_DELIVERY');
        fireEvent.click(await screen.findByRole('button', { name: 'Enter delivery code' }));
        fireEvent.change(screen.getByPlaceholderText('e.g. 042781'), { target: { value: ' 042781 ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
        expect(api.post).toHaveBeenCalledWith(
            '/rider/orders/order-1/confirm',
            { deliveryCode: '042781' },
            'rider-token',
        );
    });

    it('marks the order out for delivery and then asks for the customer code', async () => {
        api.post.mockResolvedValue({ data: { orderId: 'order-1' } });
        renderOrder('RIDER_ACCEPTED');
        fireEvent.click(await screen.findByRole('button', { name: 'Mark out for delivery' }));
        fireEvent.click(screen.getByRole('button', { name: 'Start delivery' }));
        expect(api.post).toHaveBeenCalledWith('/rider/orders/order-1/pickup', {}, 'rider-token');
        expect(await screen.findByRole('button', { name: 'Enter delivery code' })).toBeTruthy();
    });
});
