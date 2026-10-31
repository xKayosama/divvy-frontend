import type { GroupMember, Invitation, InvitationStatus } from '../types.ts';

export const normalizeInvitationCode = (value: string) =>
  value.trim().toLowerCase();
export const validInvitationCode = (value: string) =>
  /^[a-f0-9]{32}$/.test(normalizeInvitationCode(value));
export function invitationStatus(
  invitation: Invitation,
  now = Date.now(),
): InvitationStatus {
  return invitation.status === 'PENDING' &&
    (!Number.isFinite(Date.parse(invitation.expiresAt)) ||
      Date.parse(invitation.expiresAt) <= now)
    ? 'EXPIRED'
    : invitation.status;
}
export function invitationVersion(invitation: Invitation) {
  return { invitationId: invitation.id, createdAt: invitation.createdAt };
}
export function canManageMembers(
  members: GroupMember[],
  account: { id?: string; _id?: string } | null,
) {
  const id = account?._id || account?.id;
  return (
    !!id &&
    members.some(
      (member) =>
        member.status === 'ACTIVE' &&
        member.role === 'OWNER' &&
        member.userId?._id === id,
    )
  );
}
