import test from 'node:test';
import assert from 'node:assert/strict';
import {
  notificationTarget,
  unreadLabel,
} from '../src/features/notifications/lib/notification-target.ts';
const base = {
  id: 'one',
  type: 'bill-reminder',
  title: 'Reminder',
  body: 'Body',
  createdAt: '2026-11-01',
  readAt: null,
};
test('invitations open the inbox without requiring a group selection', () => {
  assert.deepEqual(
    notificationTarget({ ...base, type: 'invitation', groupId: 'stale' }),
    { path: '/invitations', label: 'View invitations' },
  );
});
test('bill targets carry their group for fresh membership verification', () => {
  assert.deepEqual(
    notificationTarget({ ...base, groupId: 'other-group', billId: 'bill/1?x' }),
    {
      path: '/bills?billId=bill%2F1%3Fx',
      groupId: 'other-group',
      label: 'View bill',
    },
  );
  assert.deepEqual(notificationTarget({ ...base, groupId: 'other-group' }), {
    path: '/bills',
    groupId: 'other-group',
    label: 'View bills',
  });
});
test('cross-group digests never open the currently selected group by assumption', () => {
  assert.deepEqual(notificationTarget(base), {
    path: '/groups',
    label: 'View groups',
  });
  assert.equal(
    notificationTarget({ ...base, type: 'unknown-future-type' }),
    null,
  );
});
test('unread badges stay compact without losing the full accessible count', () => {
  assert.equal(unreadLabel(0), '0');
  assert.equal(unreadLabel(99), '99');
  assert.equal(unreadLabel(120), '99+');
});
