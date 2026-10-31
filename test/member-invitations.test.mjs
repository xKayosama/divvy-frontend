import test from 'node:test';
import assert from 'node:assert/strict';
import { canManageMembers, invitationStatus, invitationVersion, normalizeInvitationCode, validInvitationCode } from '../src/features/members/lib/invitations.ts';

const invitation = { id: 'invite', createdAt: '2026-10-29T01:00:00.000Z', expiresAt: '2026-11-05T01:00:00.000Z', status: 'PENDING' };
test('expired, malformed and terminal invitations cannot be shown as pending', () => {
  const now = Date.parse('2026-11-05T01:00:00.000Z');
  assert.equal(invitationStatus(invitation, now - 1), 'PENDING');
  assert.equal(invitationStatus(invitation, now), 'EXPIRED');
  assert.equal(invitationStatus({ ...invitation, expiresAt: 'invalid' }, now), 'EXPIRED');
  for (const status of ['ACCEPTED', 'DECLINED', 'REVOKED', 'EXPIRED']) assert.equal(invitationStatus({ ...invitation, status }, now), status);
});
test('code validation accepts only complete hex codes and normalizes casing', () => {
  assert.equal(normalizeInvitationCode(' A'.padEnd(33, 'B') + ' '), 'a'+'b'.repeat(31));
  assert.ok(validInvitationCode(' '+ 'A'.repeat(32)+' '));
  for (const code of ['', 'a'.repeat(31), 'a'.repeat(33), 'z'.repeat(32), 'a'.repeat(15)+' '+'a'.repeat(16)]) assert.equal(validInvitationCode(code), false);
});
test('response and revoke payloads retain the exact invitation generation', () => {
  assert.deepEqual(invitationVersion(invitation), { invitationId: 'invite', createdAt: '2026-10-29T01:00:00.000Z' });
  const replacement = { ...invitation, createdAt: '2026-10-30T01:00:00.000Z' };
  assert.notDeepEqual(invitationVersion(invitation), invitationVersion(replacement));
});
test('owner controls require current active roster membership for the current account', () => {
  const owner = { userId: { _id: 'owner' }, role: 'OWNER', status: 'ACTIVE' };
  assert.ok(canManageMembers([owner], { id: 'owner' }));
  assert.ok(canManageMembers([owner], { _id: 'owner' }));
  assert.equal(canManageMembers([owner], { id: 'member' }), false);
  assert.equal(canManageMembers([{ ...owner, status: 'INACTIVE' }], { id: 'owner' }), false);
  assert.equal(canManageMembers([{ ...owner, role: 'MEMBER' }], { id: 'owner' }), false);
  assert.equal(canManageMembers([{ ...owner, userId: null }], { id: 'owner' }), false);
  assert.equal(canManageMembers([], null), false);
});
