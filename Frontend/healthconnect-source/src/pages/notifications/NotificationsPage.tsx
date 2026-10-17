import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import { useNotifications } from '../../lib/useNotifications';
import { filterNotifications } from '../../lib/emergencyRules';
import { isDemoMode } from '../../lib/demo';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { BrowserAlertSettings } from '../../components/notifications/BrowserAlertSettings';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export function NotificationsPage() {
  const [unread, setUnread] = useState(false);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const client = useQueryClient();
  const query = useNotifications();
  const all = query.data?.data ?? [];
  const items = filterNotifications(all, unread, category, search);
  const unreadCount = all.filter(item => !item.read).length;
  const changed = () => client.invalidateQueries({ queryKey: ['notifications'] });
  const mark = useMutation({ mutationFn: notificationApi.markAsRead, onSuccess: changed });
  const markAll = useMutation({ mutationFn: notificationApi.markAllAsRead, onSuccess: changed });
  const pending = mark.isPending || markAll.isPending;
  const failure = mark.error ?? markAll.error;
  return <div className="space-y-6 max-w-4xl mx-auto">
    <div className="flex flex-wrap justify-between items-center gap-4"><div>
      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Phase 5 � Your updates</p>
      <h1 className="text-2xl font-black mt-2">Notification inbox</h1>
      <p className="text-sm text-slate-500 mt-2">{isDemoMode ? 'Updates from your demo SOS actions. Read status stays saved for this account.' : 'Your account updates refresh every 15 seconds while this app is open.'}</p>
    </div><Button variant="outline" disabled={pending || unreadCount === 0 || query.isError} isLoading={markAll.isPending} onClick={() => markAll.mutate()}>Mark all as read</Button></div>
    <BrowserAlertSettings />
    <div className="flex flex-wrap items-center gap-3">
      <button aria-pressed={!unread} className={'rounded-xl px-4 py-2 border text-sm ' + (!unread ? 'bg-teal-600 text-white' : '')} onClick={() => setUnread(false)}>All ({all.length})</button>
      <button aria-pressed={unread} className={'rounded-xl px-4 py-2 border text-sm ' + (unread ? 'bg-teal-600 text-white' : '')} onClick={() => setUnread(true)}>Unread ({unreadCount})</button>
      <label className="text-sm">Category <select className="border p-2 rounded-lg dark:bg-slate-900" value={category} onChange={e => setCategory(e.target.value)}><option value="ALL">All categories</option><option value="EMERGENCY">Emergency</option><option value="OTHER">Other updates</option></select></label>
      <Button variant="ghost" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>Refresh inbox</Button>
    </div>
    <label className="block text-sm font-medium">Search notifications<input className="block w-full border rounded-xl p-3 mt-2 dark:bg-slate-900" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your updates" /></label>
    {failure && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{failure.message}</p>}
    {query.isLoading ? <LoadingSkeleton type="list" count={3} /> : query.isError ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      : items.length === 0 ? <EmptyState icon={Bell} title="No notifications in this view" description={all.length ? 'Adjust the filters to see more updates.' : 'Your saved SOS actions will appear here.'} />
      : <div className="space-y-3">{items.map(item => <NotificationItem key={item.id} notification={item} busy={pending} onMarkRead={id => mark.mutate(id)} />)}</div>}
  </div>;
}
