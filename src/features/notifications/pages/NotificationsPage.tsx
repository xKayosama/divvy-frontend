import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, Mail, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { store } from '@/app/store';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { PagePagination } from '@/components/ui/page-pagination';
import { accountId } from '@/lib/format';
import { cn } from '@/lib/utils';
import { apiMessage } from '@/services/api-error';
import { groupApi } from '@/features/groups/groupApi';
import { setSelectedGroup } from '@/features/groups/groupSlice';
import {
  notificationApi,
  useGetNotificationInboxQuery,
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
} from '../notificationApi';
import { notificationTarget } from '../lib/notification-target';
import type { InboxNotification } from '../types';
export default function NotificationsPage() {
  const id = accountId(useAppSelector((state) => state.auth.user));
  return id ? <Inbox key={id} id={id} /> : null;
}
function Inbox({ id }: { id: string }) {
  const dispatch = useAppDispatch(),
    navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const [page, setPage] = useState(1),
    [pending, setPending] = useState(''),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const lock = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const current = () =>
    mounted.current &&
    accountId(store.getState().auth.user) === id &&
    store.getState().auth.token === token;
  const query = useGetNotificationInboxQuery(
    { accountId: id, page },
    {
      pollingInterval: 60000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const [read] = useReadNotificationMutation(),
    [readAll] = useReadAllNotificationsMutation();
  const data = query.currentData?.data,
    busy = !!pending;
  function refresh() {
    setError('');
    dispatch(notificationApi.util.invalidateTags(['Notification']));
  }
  async function mark(item?: InboxNotification) {
    if (lock.current) return;
    lock.current = true;
    setPending(item?.id ?? 'all');
    setError('');
    setNotice('');
    try {
      if (item) await read(item.id).unwrap();
      else await readAll().unwrap();
      if (current())
        setNotice(
          item
            ? 'Notification marked as read.'
            : 'All current notifications marked as read.',
        );
    } catch (caught) {
      if (current())
        setError(
          apiMessage(
            caught,
            'Could not update notifications. Please try again.',
          ),
        );
    } finally {
      lock.current = false;
      if (current()) setPending('');
    }
  }
  async function open(item: InboxNotification) {
    const target = notificationTarget(item);
    if (!target || lock.current) return;
    lock.current = true;
    setPending(`open:${item.id}`);
    setError('');
    setNotice('');
    try {
      let group;
      if ('groupId' in target && target.groupId) {
        const request = dispatch(
          groupApi.endpoints.getGroups.initiate(undefined, {
            forceRefetch: true,
          }),
        );
        try {
          const response = await request.unwrap();
          group = response.data.groups.find(
            (value) => value.id === target.groupId,
          );
        } finally {
          request.unsubscribe();
        }
        if (!current()) return;
        if (!group) {
          setError(
            'This group is no longer available. Open Groups to review the groups you can access.',
          );
          return;
        }
      }
      if (!current()) return;
      if (!item.readAt) await read(item.id).unwrap();
      if (!current()) return;
      if (group) dispatch(setSelectedGroup(group));
      navigate(target.path);
    } catch (caught) {
      if (current())
        setError(
          apiMessage(
            caught,
            'Could not open this notification. Please try again.',
          ),
        );
    } finally {
      lock.current = false;
      if (current()) setPending('');
    }
  }
  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeader
        eyebrow="Your account · All groups"
        title="Notifications"
        description="Keep up with bill reminders and group invitations."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={busy || query.isFetching}
              onClick={refresh}
            >
              <RefreshCw data-icon="inline-start" />
              Refresh
            </Button>
            <Button
              disabled={
                busy || query.isFetching || !!query.error || !data?.unreadCount
              }
              onClick={() => mark()}
            >
              {pending === 'all' ? 'Marking all…' : 'Mark all as read'}
            </Button>
          </div>
        }
      />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {notice && (
        <p role="status" className="text-sm text-primary">
          {notice}
        </p>
      )}
      <Card className="rounded-2xl py-0 shadow-sm">
        <CardHeader className="border-b bg-secondary/35 px-5 py-5">
          <CardTitle>Your inbox</CardTitle>
          <CardDescription>
            {data && !query.error
              ? `${data.unreadCount} unread · ${data.pagination.total} ${data.pagination.total === 1 ? 'notification' : 'notifications'}`
              : 'Bill reminders and invitations for your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0" aria-busy={query.isFetching || busy}>
          {query.error ? (
            <div className="p-5">
              <Alert variant="destructive">
                <AlertDescription>
                  <p>Could not load notifications.</p>
                  <Button
                    variant="outline"
                    onClick={refresh}
                    disabled={query.isFetching}
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : !data ? (
            <div
              role="status"
              aria-label="Loading notifications"
              className="flex flex-col gap-4 p-5"
            >
              {[1, 2, 3].map((value) => (
                <Skeleton key={value} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {query.isFetching && (
                <p
                  role="status"
                  className="px-5 pt-4 text-sm text-muted-foreground"
                >
                  Updating notifications…
                </p>
              )}
              {!data.notifications.length ? (
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Bell />
                    </EmptyMedia>
                    <EmptyTitle>
                      {page > 1
                        ? 'No notifications on this page'
                        : 'You’re all caught up'}
                    </EmptyTitle>
                    <EmptyDescription>
                      New bill reminders and invitations will appear here. Older
                      events are not backfilled.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="divide-y">
                  {data.notifications.map((item) => {
                    const Icon =
                        item.type === 'invitation'
                          ? Mail
                          : item.type === 'bill-reminder'
                            ? FileText
                            : Bell,
                      target = notificationTarget(item);
                    return (
                      <li
                        key={item.id}
                        className={cn(
                          'flex gap-3 px-5 py-5',
                          !item.readAt && 'bg-secondary/30',
                        )}
                      >
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"
                          aria-hidden="true"
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="break-words font-semibold">
                              {item.title}
                            </h2>
                            {!item.readAt && <Badge>Unread</Badge>}
                          </div>
                          <p className="break-words text-sm text-muted-foreground">
                            {item.body}
                          </p>
                          <time
                            dateTime={item.createdAt}
                            className="text-xs text-muted-foreground"
                          >
                            {new Date(item.createdAt).toLocaleString('en-PH')}
                          </time>
                          <div className="flex flex-wrap gap-2">
                            {target && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => open(item)}
                                aria-label={`${target.label}: ${item.title}`}
                              >
                                {pending === `open:${item.id}`
                                  ? 'Opening…'
                                  : target.label}
                              </Button>
                            )}
                            {!item.readAt && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={busy}
                                onClick={() => mark(item)}
                                aria-label={`Mark as read: ${item.title}`}
                              >
                                {pending === item.id
                                  ? 'Marking…'
                                  : 'Mark as read'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {(data.pagination.totalPages > 1 || page > 1) && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {Math.max(1, data.pagination.totalPages)}
                  </p>
                  <PagePagination
                    aria-label="Notification pages"
                    page={page}
                    totalPages={data.pagination.totalPages}
                    disabled={query.isFetching || busy}
                    onPageChange={(next) => {
                      setPage(next);
                      setError('');
                      setNotice('');
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
