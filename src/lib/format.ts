import type { UserSummary } from '@/types/user';
export const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
export const personName = (user: UserSummary | null | undefined) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : 'Former member';
export const userId = (user: string | UserSummary | null) =>
  typeof user === 'string' ? user : (user?._id ?? '');
