import type { UserSummary } from '@/types/user';
export interface MemberUser extends UserSummary {
  email: string;
  avatar: string | null;
}

export interface GroupMember {
  _id: string;
  groupId: string;
  userId: MemberUser;
  role: 'OWNER' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembersResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    members: GroupMember[];
  };
}

export type InvitationStatus =
  'PENDING' | 'EXPIRED' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';
export interface Invitation {
  id: string;
  email: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  group: { id: string; name: string; currency: string; icon?: string };
}
export interface InvitationsResponse {
  success: boolean;
  data: { invitations: Invitation[] };
}
export interface InvitationResponse {
  success: boolean;
  message?: string;
  data: { invitation: Invitation };
}
export interface CreatedInvitationResponse extends InvitationResponse {
  data: { invitation: Invitation; code: string };
}
