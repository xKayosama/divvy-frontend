import type { UserSummary } from '@/types/user';
export interface BalanceUser extends UserSummary {
  email?: string;
  avatar?: string | null;
  deletedAt?: string | null;
}
export interface MemberBalance {
  user: BalanceUser;
  paid: number;
  owed: number;
  net: number;
  settlementPaid: number;
  settlementReceived: number;
}
export interface BalancesResponse {
  success: boolean;
  data: { totalExpenses: number; totalOwed: number; members: MemberBalance[] };
}
