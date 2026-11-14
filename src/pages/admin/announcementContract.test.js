import { describe, expect, it } from 'vitest';
import {
    activeAnnouncements,
    announcementIdFromPush,
    buildDraftPayload,
    listPath,
} from './announcementContract';

const base = {
    title: 'Weekend offer',
    summary: 'See this weekend’s offer',
    audience: 'CUSTOMERS',
    category: 'PROMOTION',
    blocks: [],
    image: null,
    imageAltText: '',
    ctaEnabled: false,
    ctaLabel: '',
    ctaDestination: 'HOME',
    vendorId: '',
    productId: '',
    priority: 0,
    dismissible: true,
    endsAt: '',
    pushEnabled: false,
    pushPreview: '',
};

describe('announcement contract', () => {
    it('builds text-only, image-only, and image-plus-text drafts', () => {
        const text = buildDraftPayload({ ...base, blocks: [{ type: 'paragraph', text: 'Hello', bold: true, italic: false, link: 'https://getyovo.app/offer' }] });
        expect(text.payload.body).toEqual({ version: 1, blocks: [{ type: 'paragraph', spans: [{ text: 'Hello', bold: true, link: 'https://getyovo.app/offer' }] }] });
        expect(text.payload.imageAssetId).toBeUndefined();

        const image = buildDraftPayload({ ...base, image: { id: 'asset_01abc' }, imageAltText: 'Flyer' });
        expect(image.payload.imageAssetId).toBe('asset_01abc');
        expect(image.payload.imageAltText).toBe('Flyer');
        expect(image.payload.body).toBeUndefined();

        const both = buildDraftPayload({ ...base, blocks: [{ type: 'heading', level: 2, text: 'Update', bold: false, italic: true, link: '' }], image: { id: 'asset_01abc' }, imageAltText: 'Flyer' });
        expect(both.payload.body.blocks[0].type).toBe('heading');
        expect(both.payload.imageAssetId).toBe('asset_01abc');
    });

    it('keeps each audience and rejects a mixed-audience call to action', () => {
        for (const audience of ['CUSTOMERS', 'VENDORS', 'ALL_CUSTOMERS_AND_VENDORS']) {
            const result = buildDraftPayload({ ...base, audience, blocks: [{ type: 'paragraph', text: 'Hello', bold: false, italic: false, link: '' }] });
            expect(result.payload.audience).toBe(audience);
            expect(JSON.stringify(result.payload)).not.toContain('ALL_USERS');
        }
        const mixed = buildDraftPayload({ ...base, audience: 'ALL_CUSTOMERS_AND_VENDORS', ctaEnabled: true, ctaLabel: 'Open', blocks: [{ type: 'paragraph', text: 'Hello', bold: false, italic: false, link: '' }] });
        expect(mixed.error).toMatch(/not available/i);
    });

    it('requires the documented CTA params and omits params otherwise', () => {
        const home = buildDraftPayload({ ...base, ctaEnabled: true, ctaLabel: 'Browse', ctaDestination: 'HOME', blocks: [{ type: 'paragraph', text: 'Hello', bold: false, italic: false, link: '' }] });
        expect(home.payload.cta).toEqual({ label: 'Browse', destination: 'HOME' });

        const store = buildDraftPayload({ ...base, ctaEnabled: true, ctaLabel: 'Store', ctaDestination: 'STORE', vendorId: 'vendor_1', blocks: [{ type: 'paragraph', text: 'Hello', bold: false, italic: false, link: '' }] });
        expect(store.payload.cta.params).toEqual({ vendorId: 'vendor_1' });

        const product = buildDraftPayload({ ...base, ctaEnabled: true, ctaLabel: 'Item', ctaDestination: 'PRODUCT', vendorId: 'vendor_1', productId: 'product_1', blocks: [{ type: 'paragraph', text: 'Hello', bold: false, italic: false, link: '' }] });
        expect(product.payload.cta.params).toEqual({ vendorId: 'vendor_1', productId: 'product_1' });

        const missing = buildDraftPayload({ ...base, ctaEnabled: true, ctaLabel: 'Store', ctaDestination: 'STORE', blocks: [{ type: 'paragraph', text: 'Hello', bold: false, italic: false, link: '' }] });
        expect(missing.error).toMatch(/vendor id/i);
    });

    it('lists with documented query fields and reads the mobile array from data', () => {
        expect(listPath({ page: 2, limit: 50, status: 'DRAFT', audience: 'VENDORS', query: 'weekend' })).toBe('/superadmin/announcements?page=2&limit=50&status=DRAFT&audience=VENDORS&query=weekend');
        expect(activeAnnouncements({ data: [{ id: 'ann_01' }] })).toEqual([{ id: 'ann_01' }]);
        expect(() => activeAnnouncements({ data: { data: [] } })).toThrow(/data array/);
        expect(announcementIdFromPush({ type: 'ANNOUNCEMENT', announcementId: 'announcement1' })).toBe('announcement1');
        expect(announcementIdFromPush({ type: 'PROMO', announcementId: 'announcement1' })).toBeNull();
    });
});
