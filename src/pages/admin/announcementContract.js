export const AUDIENCES = ['CUSTOMERS', 'VENDORS', 'ALL_CUSTOMERS_AND_VENDORS'];
export const CATEGORIES = ['PROMOTION', 'ANNOUNCEMENT', 'SERVICE_UPDATE'];
export const STATUSES = ['DRAFT', 'PUBLISHED', 'DEACTIVATED'];

export const CUSTOMER_CTA_DESTINATIONS = [
    'HOME', 'SEARCH', 'CART', 'ORDERS', 'ORDER_HISTORY', 'WALLET', 'REFER_AND_EARN',
    'FAVOURITES', 'ADDRESSES', 'NOTIFICATIONS', 'SUPPORT', 'STORE', 'PRODUCT',
];

export const VENDOR_CTA_DESTINATIONS = [
    'VENDOR_DASHBOARD', 'VENDOR_ORDERS', 'VENDOR_PRODUCTS', 'VENDOR_CATEGORIES',
    'VENDOR_WALLET', 'VENDOR_PERFORMANCE', 'VENDOR_STORE_SETTINGS',
];

export const LIMITS = {
    title: 120,
    summary: 160,
    alt: 200,
    pushPreview: 160,
    ctaLabel: 40,
    priorityMax: 100,
    query: 80,
    blocks: 40,
    spans: 40,
    listItems: 30,
    spanText: 500,
    bodyJson: 20000,
    imageBytes: 1024 * 1024,
    imageWidth: 1600,
    idempotencyMin: 8,
    idempotencyMax: 120,
};

const ID_PATTERN = /^[A-Za-z0-9_-]{6,80}$/;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const AUDIENCE_LABELS = {
    CUSTOMERS: 'Customers',
    VENDORS: 'Vendors',
    ALL_CUSTOMERS_AND_VENDORS: 'Customers and vendors',
};

export const CATEGORY_LABELS = {
    PROMOTION: 'Promotion',
    ANNOUNCEMENT: 'Announcement',
    SERVICE_UPDATE: 'Service update',
};

export const STATUS_LABELS = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    DEACTIVATED: 'Deactivated',
};

export const PUSH_COUNT_FIELDS = [
    ['pending', 'Pending'],
    ['attempting', 'Attempting'],
    ['accepted', 'Accepted by provider'],
    ['failed', 'Failed'],
    ['exhausted', 'Exhausted'],
    ['noToken', 'No token'],
    ['cancelled', 'Cancelled'],
];

export const emptyBlock = (type) => {
    if (type === 'bulleted_list' || type === 'numbered_list') return { type, items: [''] };
    if (type === 'heading') return { type, level: 1, text: '', bold: false, italic: false, link: '' };
    return { type: 'paragraph', text: '', bold: false, italic: false, link: '' };
};

const httpsLink = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    let parsed;
    try {
        parsed = new URL(trimmed);
    } catch {
        return { error: 'Links must be valid HTTPS URLs.' };
    }
    if (parsed.protocol !== 'https:') return { error: 'Links must be HTTPS URLs.' };
    if (parsed.username || parsed.password) return { error: 'Links must not include credentials.' };
    return { href: parsed.toString() };
};

const spanFromText = (text, bold, italic, link) => {
    if (!text || text.length > LIMITS.spanText) return { error: 'Each text span must be 1 to 500 characters.' };
    if (/<\/?[a-z][\s\S]*>/i.test(text)) return { error: 'Announcement text must not contain HTML.' };
    const span = { text };
    if (bold) span.bold = true;
    if (italic) span.italic = true;
    if (link?.trim()) {
        const checked = httpsLink(link);
        if (checked.error) return checked;
        span.link = checked.href;
    }
    return { span };
};

export function bodyFromBlocks(blocks) {
    if (!blocks?.length) return { body: null };
    if (blocks.length > LIMITS.blocks) return { error: 'A broadcast can have at most 40 blocks.' };
    const out = [];
    for (const block of blocks) {
        if (block.type === 'paragraph' || block.type === 'heading') {
            const parsed = spanFromText(block.text.trim(), block.bold, block.italic, block.link);
            if (parsed.error) return parsed;
            if (block.type === 'heading') {
                const level = Number(block.level);
                if (level !== 1 && level !== 2) return { error: 'Heading level must be 1 or 2.' };
                out.push({ type: 'heading', level, spans: [parsed.span] });
            } else {
                out.push({ type: 'paragraph', spans: [parsed.span] });
            }
        } else if (block.type === 'bulleted_list' || block.type === 'numbered_list') {
            const items = (block.items || []).map((item) => item.trim()).filter(Boolean);
            if (!items.length) return { error: 'A list needs at least one item.' };
            if (items.length > LIMITS.listItems) return { error: 'A list can have at most 30 items.' };
            const parsedItems = [];
            for (const item of items) {
                const parsed = spanFromText(item, false, false, '');
                if (parsed.error) return parsed;
                parsedItems.push({ spans: [parsed.span] });
            }
            out.push({ type: block.type, items: parsedItems });
        } else {
            return { error: 'Unsupported announcement block.' };
        }
    }
    const body = { version: 1, blocks: out };
    if (JSON.stringify(body).length > LIMITS.bodyJson) return { error: 'Announcement body is too large.' };
    return { body };
}

export function destinationsForAudience(audience) {
    if (audience === 'CUSTOMERS') return CUSTOMER_CTA_DESTINATIONS;
    if (audience === 'VENDORS') return VENDOR_CTA_DESTINATIONS;
    return [];
}

export function buildDraftPayload(form, { forUpdate = false } = {}) {
    const title = form.title.trim();
    const summary = form.summary.trim();
    if (!title || title.length > LIMITS.title) return { error: 'Title must be 1 to 120 characters.' };
    if (!summary || summary.length > LIMITS.summary) return { error: 'Summary must be 1 to 160 characters.' };
    if (!AUDIENCES.includes(form.audience)) return { error: 'Choose customers, vendors, or both.' };
    if (!CATEGORIES.includes(form.category)) return { error: 'Choose a category.' };

    const built = bodyFromBlocks(form.blocks);
    if (built.error) return built;
    const imageAssetId = form.image?.id || null;
    if (!built.body && !imageAssetId) return { error: 'Add announcement text or a flyer image.' };
    if (imageAssetId && imageAssetId.length < 10) return { error: 'Use the image asset id returned by the upload.' };
    const imageAltText = form.imageAltText.trim();
    if (imageAssetId && (!imageAltText || imageAltText.length > LIMITS.alt)) return { error: 'Image alt text is required and must be 200 characters or less.' };

    let cta;
    if (form.ctaEnabled) {
        if (form.audience === 'ALL_CUSTOMERS_AND_VENDORS') {
            return { error: 'A call to action is not available for customers and vendors together. Choose one audience, or leave the call to action off.' };
        }
        const label = form.ctaLabel.trim();
        if (!label || label.length > LIMITS.ctaLabel) return { error: 'Call to action label must be 1 to 40 characters.' };
        const allowed = destinationsForAudience(form.audience);
        if (!allowed.includes(form.ctaDestination)) return { error: 'That destination is not available for this audience.' };
        if (form.ctaDestination === 'STORE' || form.ctaDestination === 'PRODUCT') {
            const vendorId = form.vendorId.trim();
            if (!ID_PATTERN.test(vendorId)) return { error: 'STORE and PRODUCT need a vendor id of 6 to 80 letters, numbers, underscores, or hyphens.' };
            if (form.ctaDestination === 'STORE') {
                cta = { label, destination: 'STORE', params: { vendorId } };
            } else {
                const productId = form.productId.trim();
                if (!ID_PATTERN.test(productId)) return { error: 'PRODUCT needs a product id of 6 to 80 letters, numbers, underscores, or hyphens.' };
                cta = { label, destination: 'PRODUCT', params: { vendorId, productId } };
            }
        } else {
            cta = { label, destination: form.ctaDestination };
        }
    }

    const priority = Number(form.priority);
    if (!Number.isInteger(priority) || priority < 0 || priority > LIMITS.priorityMax) return { error: 'Priority must be a whole number from 0 to 100.' };

    let endsAt;
    if (form.endsAt) {
        const parsed = new Date(form.endsAt);
        if (Number.isNaN(parsed.getTime())) return { error: 'End time must be a valid date.' };
        endsAt = parsed.toISOString();
    }

    const pushPreview = form.pushPreview.trim();
    if (pushPreview.length > LIMITS.pushPreview) return { error: 'Push preview must be 160 characters or less.' };

    const payload = {
        title,
        summary,
        audience: form.audience,
        category: form.category,
        priority,
        dismissible: form.dismissible !== false,
        pushEnabled: Boolean(form.pushEnabled),
    };
    if (built.body) payload.body = built.body;
    else if (forUpdate) payload.body = null;
    if (imageAssetId) {
        payload.imageAssetId = imageAssetId;
        payload.imageAltText = imageAltText;
    } else if (forUpdate) {
        payload.imageAssetId = null;
        payload.imageAltText = null;
    }
    if (cta) payload.cta = cta;
    else if (forUpdate) payload.cta = null;
    if (endsAt) payload.endsAt = endsAt;
    else if (forUpdate) payload.endsAt = null;
    if (pushPreview) payload.pushPreview = pushPreview;
    else if (forUpdate) payload.pushPreview = null;
    return { payload };
}

export function validateImageFile(file) {
    if (!file) return 'Choose an image.';
    if (!IMAGE_TYPES.has(file.type)) return 'Use a JPEG, PNG, or WebP image.';
    if (file.size > LIMITS.imageBytes) return 'Image must not exceed 1 MB.';
    return null;
}

export function validateImageWidth(width) {
    if (!Number.isFinite(width)) return null;
    if (width > LIMITS.imageWidth) return 'Image width must be 1600 pixels or less.';
    return null;
}

export function listPath({ page = 1, limit = 20, status = '', audience = '', query = '' }) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(Math.min(50, Math.max(1, limit))));
    if (status) params.set('status', status);
    if (audience) params.set('audience', audience);
    const trimmed = query.trim();
    if (trimmed) params.set('query', trimmed.slice(0, LIMITS.query));
    return `/superadmin/announcements?${params.toString()}`;
}

export function activeAnnouncements(response) {
    const data = response?.data;
    if (!Array.isArray(data)) {
        throw new Error('Active announcements must be returned as data array, not data.data.');
    }
    return data;
}

export function announcementIdFromPush(data) {
    if (!data || typeof data !== 'object') return null;
    if (data.type !== 'ANNOUNCEMENT') return null;
    const id = data.announcementId;
    if (typeof id !== 'string' || id.length < 10) return null;
    return id;
}

export function isAnnouncementUnavailable(error) {
    return error?.status === 404 || /no longer available/i.test(error?.message || '');
}

export function visibleCta(announcement, role) {
    const cta = announcement?.cta;
    if (!cta?.label || !cta.destination) return null;
    const allowed = role === 'VENDOR' ? VENDOR_CTA_DESTINATIONS : CUSTOMER_CTA_DESTINATIONS;
    if (!allowed.includes(cta.destination)) return null;
    return cta;
}

export function isSafeHttps(url) {
    if (typeof url !== 'string' || !url.trim()) return null;
    const checked = httpsLink(url);
    return checked?.href || null;
}

export function newIdempotencyKey() {
    const key = globalThis.crypto?.randomUUID?.() || `announcement-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return key.slice(0, LIMITS.idempotencyMax);
}

export function previewAnnouncement(form) {
    const built = bodyFromBlocks(form.blocks || []);
    const image = form.image?.url ? {
        url: form.image.url,
        altText: form.imageAltText.trim() || 'Announcement image',
        width: form.image.width,
        height: form.image.height,
    } : null;
    let cta = null;
    if (form.ctaEnabled && form.audience !== 'ALL_CUSTOMERS_AND_VENDORS' && form.ctaLabel.trim() && destinationsForAudience(form.audience).includes(form.ctaDestination)) {
        cta = { label: form.ctaLabel.trim(), destination: form.ctaDestination };
        if (form.ctaDestination === 'STORE' && form.vendorId.trim()) cta.params = { vendorId: form.vendorId.trim() };
        if (form.ctaDestination === 'PRODUCT' && form.vendorId.trim() && form.productId.trim()) cta.params = { vendorId: form.vendorId.trim(), productId: form.productId.trim() };
    }
    return {
        id: form.id || 'preview',
        title: form.title.trim() || 'Broadcast title',
        summary: form.summary.trim() || 'Short summary',
        category: form.category,
        audience: form.audience,
        image,
        body: built.body,
        cta,
        priority: Number(form.priority) || 0,
        dismissible: form.dismissible !== false,
    };
}

function toDateTimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (part) => String(part).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formFromDetail(detail) {
    const blocks = Array.isArray(detail.body?.blocks) ? detail.body.blocks.map((block) => {
        if (block.type === 'paragraph' || block.type === 'heading') {
            const span = block.spans?.[0] || {};
            return {
                type: block.type,
                level: block.level || 1,
                text: span.text || '',
                bold: Boolean(span.bold),
                italic: Boolean(span.italic),
                link: span.link || '',
            };
        }
        return { type: block.type, items: (block.items || []).map((item) => item.spans?.[0]?.text || '') };
    }) : [];
    return {
        id: detail.id,
        title: detail.title || '',
        summary: detail.summary || '',
        audience: detail.audience || 'CUSTOMERS',
        category: detail.category || 'ANNOUNCEMENT',
        blocks,
        image: detail.image ? {
            id: detail.image.id,
            url: detail.image.url,
            width: detail.image.width,
            height: detail.image.height,
            format: detail.image.format,
            bytes: detail.image.bytes,
        } : null,
        imageAltText: detail.image?.altText || '',
        ctaEnabled: Boolean(detail.cta),
        ctaLabel: detail.cta?.label || '',
        ctaDestination: detail.cta?.destination || 'HOME',
        vendorId: detail.cta?.params?.vendorId || '',
        productId: detail.cta?.params?.productId || '',
        priority: detail.priority ?? 0,
        dismissible: detail.dismissible !== false,
        endsAt: toDateTimeLocal(detail.endsAt),
        pushEnabled: Boolean(detail.pushEnabled),
        pushPreview: detail.pushPreview || '',
    };
}

export const blankForm = () => ({
    id: null,
    title: '',
    summary: '',
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
});
