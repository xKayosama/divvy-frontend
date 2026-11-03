import type { User } from '../types.ts';

export type AuthUserResponse = Omit<User, '_id' | 'avatar'> & {
  id?: string;
  _id?: string;
  avatar?: string | null;
};

export function normalizeAuthUser(user: AuthUserResponse): User {
  return { ...user, _id: user._id || user.id || '', avatar: user.avatar ?? null };
}
