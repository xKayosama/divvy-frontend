import type { InboxNotification } from '../types.ts';
export function notificationTarget(item: InboxNotification) {
  if (item.type === 'invitation')
    return { path: '/invitations', label: 'View invitations' };
  if (item.type !== 'bill-reminder') return null;
  if (!item.groupId) return { path: '/groups', label: 'View groups' };
  return {
    path: item.billId
      ? `/bills?billId=${encodeURIComponent(item.billId)}`
      : '/bills',
    groupId: item.groupId,
    label: item.billId ? 'View bill' : 'View bills',
  };
}
export function unreadLabel(count: number) {
  return count > 99 ? '99+' : String(count);
}
