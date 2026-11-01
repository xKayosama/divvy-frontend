import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { accountId } from '@/lib/format';
import { useGetNotificationUnreadCountQuery } from '../notificationApi';
import { unreadLabel } from '../lib/notification-target';
export default function NotificationBell() {
  const id = accountId(useAppSelector((state) => state.auth.user));
  const query = useGetNotificationUnreadCountQuery(id, {
    skip: !id,
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const count = query.currentData?.data.unreadCount;
  const label = query.error
    ? 'Notifications, unread count unavailable'
    : count === undefined
      ? 'Notifications'
      : `Notifications, ${count} unread`;
  return (
    <Button
      variant="ghost"
      size={count && !query.error ? 'default' : 'icon'}
      nativeButton={false}
      render={<Link to="/notifications" />}
      aria-label={label}
      title={label}
      className="shrink-0"
    >
      <Bell data-icon="inline-start" />
      {!!count && !query.error && (
        <Badge aria-hidden="true">{unreadLabel(count)}</Badge>
      )}
    </Button>
  );
}
