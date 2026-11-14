import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Promotions from './Promotions';
import api from '../../api/api';
import { toast } from 'sonner';

vi.mock('../../api/api', () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../store/useAuthStore', () => ({
    useAuthStore: (selector) => selector({ accessToken: 'test-super-admin-token' }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const promo = {
    id: 'promo_featured',
    title: 'Featured',
    isActive: true,
    placementCount: 1,
    activePlacementCount: 1,
    createdAt: '2026-10-24T16:00:00.000Z',
    updatedAt: '2026-10-24T16:00:00.000Z',
};

const placement = {
    id: 'placement_jollof',
    promotionId: promo.id,
    productId: 'product_jollof',
    isActive: true,
    sortOrder: 1,
    product: { id: 'product_jollof', name: 'Jollof Rice', price: 2000, isInStock: true, images: [] },
    vendor: { id: 'vendor_awka', storeName: 'Awka Kitchen', status: 'OPEN', shopTypeId: 'shop_restaurants' },
    shopType: { id: 'shop_restaurants', name: 'Restaurant' },
};

let promotions;
let currentPromotion;

const renderPage = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={queryClient}><Promotions /></QueryClientProvider>);
};

beforeEach(() => {
    promotions = [promo];
    currentPromotion = { ...promo, placements: [placement] };
    api.get.mockImplementation(async (path) => {
        if (path === '/superadmin/promotions') return { data: { promotions } };
        if (path === `/superadmin/promotions/${promo.id}`) return { data: { promotion: currentPromotion } };
        if (path === '/shop-types/get-all') return { data: [{ id: 'shop_restaurants', name: 'Restaurant' }] };
        if (path === '/superadmin/promotions/vendors?shopTypeId=shop_restaurants') return { data: { vendors: [{ id: 'vendor_awka', storeName: 'Awka Kitchen', status: 'OPEN', shopTypeId: 'shop_restaurants' }] } };
        if (path === '/superadmin/promotions/products?vendorId=vendor_awka') return { data: { products: [{ id: 'product_jollof', name: 'Jollof Rice', price: 2000, isInStock: true, vendorId: 'vendor_awka' }] } };
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Promotions admin screen', () => {
    it('shows a loading state while promotions are being fetched', async () => {
        let resolveRequest;
        api.get.mockReturnValueOnce(new Promise((resolve) => { resolveRequest = resolve; }));
        renderPage();
        expect(screen.getByText('Loading promotions…')).toBeTruthy();
        resolveRequest({ data: { promotions: [] } });
        expect(await screen.findByText('No promotions yet')).toBeTruthy();
    });

    it('lists API promotions and filters the list by title', async () => {
        promotions = [promo, { ...promo, id: 'promo_top', title: 'Top Selling' }];
        renderPage();
        expect(await screen.findByText('Featured')).toBeTruthy();
        expect(screen.getByText('Top Selling')).toBeTruthy();
        await userEvent.type(screen.getByPlaceholderText('Search promotions'), 'Top');
        expect(screen.queryByText('Featured')).toBeNull();
        expect(screen.getByText('Top Selling')).toBeTruthy();
    });

    it('validates and creates a trimmed promotion title', async () => {
        renderPage();
        await screen.findByText('Featured');
        await userEvent.click(screen.getByRole('button', { name: 'Add New Promotion' }));
        await userEvent.click(screen.getByRole('button', { name: 'Add', exact: true }));
        expect(screen.getByText('Title must be between 1 and 40 characters.')).toBeTruthy();
        expect(api.post).not.toHaveBeenCalled();

        await userEvent.type(screen.getByLabelText('Promotion title'), '  Top Selling  ');
        api.post.mockImplementationOnce(async (_path, body) => {
            const created = { ...promo, id: 'promo_top', title: body.title, placementCount: 0, activePlacementCount: 0 };
            promotions = [...promotions, created];
            return { message: 'Promotion created', data: { promotion: created } };
        });
        await userEvent.click(screen.getByRole('button', { name: 'Add', exact: true }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/promotions', { title: 'Top Selling', isActive: true }, 'test-super-admin-token'));
        expect(await screen.findByText('Top Selling')).toBeTruthy();
    });

    it('renames a promotion and handles duplicate-title errors', async () => {
        renderPage();
        await screen.findByText('Featured');
        await userEvent.click(screen.getByRole('button', { name: 'Rename Featured' }));
        await userEvent.clear(screen.getByLabelText('Promotion title'));
        await userEvent.type(screen.getByLabelText('Promotion title'), 'Top Selling');
        api.patch.mockRejectedValueOnce(Object.assign(new Error('A promotion with this title already exists.'), { status: 409 }));
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        expect(await screen.findByText('A promotion with this title already exists.')).toBeTruthy();
        expect(api.patch).toHaveBeenCalledWith('/superadmin/promotions/promo_featured', { title: 'Top Selling' }, 'test-super-admin-token');
        expect(toast.error).toHaveBeenCalled();
    });

    it('saves a valid promotion rename', async () => {
        api.patch.mockImplementationOnce(async (_path, body) => {
            promotions = promotions.map((item) => item.id === promo.id ? { ...item, title: body.title } : item);
            return { message: 'Promotion updated', data: { promotion: { ...promo, title: body.title } } };
        });
        renderPage();
        await screen.findByText('Featured');
        await userEvent.click(screen.getByRole('button', { name: 'Rename Featured' }));
        await userEvent.clear(screen.getByLabelText('Promotion title'));
        await userEvent.type(screen.getByLabelText('Promotion title'), 'Top Selling');
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/superadmin/promotions/promo_featured', { title: 'Top Selling' }, 'test-super-admin-token'));
        expect(await screen.findByText('Top Selling')).toBeTruthy();
    });

    it('sends promotion active-state changes to the status endpoint', async () => {
        renderPage();
        await screen.findByText('Featured');
        await userEvent.click(screen.getByRole('switch', { name: 'Deactivate Featured' }));
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/superadmin/promotions/promo_featured/status', { isActive: false }, 'test-super-admin-token'));
    });

    it('opens details, toggles an individual placement, and removes only that placement after confirmation', async () => {
        renderPage();
        await userEvent.click(await screen.findByText('Featured', { exact: true }));
        expect(await screen.findByText('Awka Kitchen · Restaurant')).toBeTruthy();

        await userEvent.click(screen.getByRole('switch', { name: 'Hide Jollof Rice' }));
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/superadmin/promotions/promo_featured/placements/placement_jollof/status', { isActive: false }, 'test-super-admin-token'));

        api.delete.mockImplementationOnce(async () => {
            currentPromotion = { ...currentPromotion, placements: [] };
            return { message: 'Placement removed', data: null };
        });
        await userEvent.click(screen.getByRole('button', { name: 'Remove Jollof Rice' }));
        const dialog = screen.getByRole('alertdialog');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Remove' }));
        await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/superadmin/promotions/promo_featured/placements/placement_jollof', undefined, 'test-super-admin-token'));
        expect(await screen.findByText('No products in this promotion')).toBeTruthy();
    });

    it('loads shop type, vendor, and product sequentially and posts only their IDs', async () => {
        renderPage();
        await userEvent.click(await screen.findByText('Featured', { exact: true }));
        await userEvent.click(await screen.findByRole('button', { name: 'Add Product' }));

        await userEvent.click(await screen.findByLabelText('Shop type'));
        await userEvent.click(await screen.findByRole('option', { name: 'Restaurant' }));
        await userEvent.click(await screen.findByLabelText('Vendor'));
        await userEvent.click(await screen.findByRole('option', { name: 'Awka Kitchen' }));
        await userEvent.click(await screen.findByLabelText('Product'));
        await userEvent.click(await screen.findByRole('option', { name: /Jollof Rice/ }));
        api.post.mockResolvedValueOnce({ message: 'Product added to promotion', data: { placement } });
        const addButtons = screen.getAllByRole('button', { name: 'Add Product', exact: true });
        await userEvent.click(addButtons[addButtons.length - 1]);

        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/promotions/promo_featured/placements', {
            shopTypeId: 'shop_restaurants', vendorId: 'vendor_awka', productId: 'product_jollof',
        }, 'test-super-admin-token'));
    });

    it('confirms before deleting a promotion and explains that catalog products remain', async () => {
        renderPage();
        await screen.findByText('Featured');
        api.delete.mockImplementationOnce(async () => {
            promotions = [];
            return { message: 'Promotion deleted', data: null };
        });
        await userEvent.click(screen.getByRole('button', { name: 'Delete Featured' }));
        const dialog = screen.getByRole('alertdialog');
        expect(within(dialog).getByText(/Catalog products will not be deleted/)).toBeTruthy();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
        await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/superadmin/promotions/promo_featured', undefined, 'test-super-admin-token'));
        expect(await screen.findByText('No promotions yet')).toBeTruthy();
    });

    it('shows a not-found error for a missing promotion detail', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/promotions') return { data: { promotions: [promo] } };
            if (path === `/superadmin/promotions/${promo.id}`) throw Object.assign(new Error('Not found'), { status: 404 });
            throw new Error(`Unexpected GET ${path}`);
        });
        renderPage();
        await userEvent.click(await screen.findByText('Featured', { exact: true }));
        expect(await screen.findByText('This promotion no longer exists.')).toBeTruthy();
    });

    it('reveals long promotion and product lists in steps', async () => {
        promotions = Array.from({ length: 9 }, (_, index) => ({ ...promo, id: `promo_${index}`, title: `Promo ${index}` }));
        currentPromotion = {
            ...promotions[0],
            placements: Array.from({ length: 4 }, (_, index) => ({
                ...placement,
                id: `placement_${index}`,
                product: { ...placement.product, id: `product_${index}`, name: `Product ${index}` },
            })),
        };
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/promotions') return { data: { promotions } };
            if (path === '/superadmin/promotions/promo_0') return { data: { promotion: currentPromotion } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText('Showing 3 of 9')).toBeTruthy();
        expect(screen.queryByText('Promo 8')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'View more promotions' }));
        expect(screen.queryByText('Promo 8')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'View more promotions' }));
        expect(screen.getByText('Promo 8')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'View less promotions' }));
        expect(screen.queryByText('Promo 8')).toBeNull();

        await user.click(screen.getByText('Promo 0'));
        expect(await screen.findByText('Product 0')).toBeTruthy();
        expect(screen.queryByText('Product 3')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'View more promotion products' }));
        expect(screen.getByText('Product 3')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'View less promotion products' }));
        expect(screen.queryByText('Product 3')).toBeNull();
    });
});
