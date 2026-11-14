import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { activeAnnouncements, isAnnouncementUnavailable } from '../../pages/admin/announcementContract';
import { AnnouncementCard, AnnouncementDetailView } from './AnnouncementView';

const unavailable = 'This announcement is no longer available.';

export function AnnouncementFeed({ token, role, refreshKey = 0 }) {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState(null);
    const [dismissingId, setDismissingId] = useState(null);
    const [actionError, setActionError] = useState('');
    const headerRole = role === 'VENDOR' ? 'VENDOR' : 'USER';

    const listQuery = useQuery({
        queryKey: ['announcements-active', headerRole, refreshKey],
        queryFn: async () => {
            const response = await api.get('/announcements/active', token, { role: headerRole });
            return activeAnnouncements(response);
        },
        enabled: Boolean(token),
    });

    const detailQuery = useQuery({
        queryKey: ['announcement-detail-mobile', selectedId, headerRole],
        queryFn: () => api.get(`/announcements/${encodeURIComponent(selectedId)}`, token, { role: headerRole }),
        enabled: Boolean(token && selectedId),
        retry: false,
    });

    const dismiss = async (id) => {
        setDismissingId(id);
        setActionError('');
        try {
            await api.post(`/announcements/${encodeURIComponent(id)}/dismiss`, {}, token, { role: headerRole });
            if (selectedId === id) setSelectedId(null);
            await queryClient.invalidateQueries({ queryKey: ['announcements-active', headerRole] });
        } catch (error) {
            if (error.status === 409) setActionError(error.message || 'This announcement cannot be dismissed.');
            else if (isAnnouncementUnavailable(error)) setActionError(unavailable);
            else setActionError(error.message || 'Could not dismiss this announcement.');
        } finally {
            setDismissingId(null);
        }
    };

    if (!token) return null;
    if (listQuery.isLoading) return <p className="text-sm text-zinc-500">Loading announcements...</p>;
    if (listQuery.isError) {
        return <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{listQuery.error.message || 'Could not load announcements.'} <button type="button" onClick={() => listQuery.refetch()} className="font-bold underline">Retry</button></div>;
    }

    const cards = listQuery.data || [];
    const detailMissing = selectedId && detailQuery.isError && isAnnouncementUnavailable(detailQuery.error);

    return (
        <section aria-label="Announcements" className="space-y-3">
            {cards.length === 0 && <p className="text-sm text-zinc-500">No announcements.</p>}
            {cards.map((announcement) => (
                <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onOpen={() => { setActionError(''); setSelectedId(announcement.id); }}
                    onDismiss={announcement.dismissible === false ? undefined : () => dismiss(announcement.id)}
                    dismissing={dismissingId === announcement.id}
                />
            ))}
            {actionError && <p role="alert" className="text-sm text-rose-700">{actionError}</p>}
            {selectedId && (
                <div role="dialog" aria-label="Announcement detail" className="rounded-2xl border border-zinc-200 bg-white p-4">
                    {detailQuery.isLoading && <p className="text-sm text-zinc-500">Loading announcement...</p>}
                    {detailMissing && <p className="text-sm text-zinc-700">{unavailable}</p>}
                    {detailQuery.isError && !detailMissing && <p role="alert" className="text-sm text-rose-700">{detailQuery.error.message || 'Could not load this announcement.'}</p>}
                    {detailQuery.data?.data && <AnnouncementDetailView announcement={detailQuery.data.data} role={headerRole} />}
                    <button type="button" onClick={() => setSelectedId(null)} className="mt-3 text-xs font-semibold text-zinc-500 underline">Close</button>
                </div>
            )}
        </section>
    );
}
