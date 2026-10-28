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
