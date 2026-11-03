import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAuthUser } from '../src/features/auth/lib/auth-user.ts';

test('backend auth IDs match populated member IDs for payer and share lookup', () => {
  const user = normalizeAuthUser({
    id: 'owner', firstName: 'Owner', lastName: 'Test', email: 'owner@example.com',
  });
  const members = [{ _id: 'other' }, { _id: 'owner' }];
  assert.equal(members.find(member => member._id === user._id)?._id, 'owner');
  assert.equal(user.avatar, null);
});

test('normalized auth users preserve profile data and existing canonical IDs', () => {
  const user = normalizeAuthUser({
    _id: 'canonical', id: 'legacy', firstName: 'Owner', lastName: 'Test',
    email: 'owner@example.com', avatar: 'avatar.png', role: 'USER',
  });
  assert.equal(user._id, 'canonical');
  assert.equal(user.avatar, 'avatar.png');
  assert.equal(user.email, 'owner@example.com');
});
