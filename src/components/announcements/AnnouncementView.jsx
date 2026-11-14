import React, { useState } from 'react';
import { isSafeHttps, visibleCta } from '../../pages/admin/announcementContract';

function Spans({ spans }) {
    return (spans || []).map((span, index) => {
        const href = isSafeHttps(span.link);
        const className = `${span.bold ? 'font-bold' : ''} ${span.italic ? 'italic' : ''}`.trim();
        const text = span.text || '';
        const content = href
            ? <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{text}</a>
            : text;
        return <span key={index} className={className}>{content}</span>;
    });
}

export function RichText({ body }) {
    if (!body || body.version !== 1 || !Array.isArray(body.blocks)) return null;
    return (
        <div className="space-y-3 text-sm leading-6 text-zinc-800">
            {body.blocks.map((block, index) => {
                if (block.type === 'paragraph') return <p key={index}><Spans spans={block.spans} /></p>;
                if (block.type === 'heading' && (block.level === 1 || block.level === 2)) {
                    const Tag = block.level === 1 ? 'h3' : 'h4';
                    return <Tag key={index} className={block.level === 1 ? 'text-lg font-bold' : 'text-base font-bold'}><Spans spans={block.spans} /></Tag>;
                }
                if (block.type === 'bulleted_list' || block.type === 'numbered_list') {
                    const List = block.type === 'numbered_list' ? 'ol' : 'ul';
                    return (
                        <List key={index} className={block.type === 'numbered_list' ? 'list-decimal space-y-1 pl-5' : 'list-disc space-y-1 pl-5'}>
                            {(block.items || []).map((item, itemIndex) => <li key={itemIndex}><Spans spans={item.spans} /></li>)}
                        </List>
                    );
                }
                return null;
            })}
        </div>
    );
}

function Flyer({ image }) {
    const [failed, setFailed] = useState(false);
    if (!image?.url) return null;
    const ratio = image.width && image.height ? `${image.width} / ${image.height}` : undefined;
    if (failed) {
        return <p className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-600">{image.altText || 'Announcement image'}</p>;
    }
    return (
        <img
            src={image.url}
            alt={image.altText || 'Announcement image'}
            width={image.width || undefined}
            height={image.height || undefined}
            style={ratio ? { aspectRatio: ratio } : undefined}
            className="w-full rounded-xl bg-zinc-100 object-cover"
            onError={() => setFailed(true)}
        />
    );
}

export function AnnouncementCard({ announcement, onOpen, onDismiss, dismissing = false }) {
    const cta = visibleCta(announcement, announcement.audience === 'VENDORS' ? 'VENDOR' : 'USER');
    return (
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <button type="button" onClick={onOpen} className="w-full text-left">
                {announcement.image && <Flyer image={announcement.image} />}
                <h3 className="mt-3 text-base font-bold text-zinc-900">{announcement.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{announcement.summary}</p>
                {cta && <span className="mt-3 inline-flex text-sm font-semibold text-emerald-800">{cta.label}</span>}
            </button>
            {announcement.dismissible !== false && onDismiss && (
                <button type="button" onClick={onDismiss} disabled={dismissing} className="mt-3 text-xs font-semibold text-zinc-500 underline disabled:opacity-50">Dismiss</button>
            )}
        </article>
    );
}

export function AnnouncementDetailView({ announcement, role = 'USER' }) {
    const cta = visibleCta(announcement, role);
    return (
        <article className="space-y-4">
            {announcement.image && <Flyer image={announcement.image} />}
            <div>
                <h2 className="text-xl font-bold text-zinc-900">{announcement.title}</h2>
                <p className="mt-1 text-sm text-zinc-600">{announcement.summary}</p>
            </div>
            <RichText body={announcement.body} />
            {cta && <p className="text-sm font-semibold text-emerald-800">{cta.label}</p>}
        </article>
    );
}
