import type { BalanceUser } from '@/features/balances/types';
import type { Pagination } from '@/types/api';
export interface SuggestedSettlement {
  from: BalanceUser;
  to: BalanceUser;
  amount: number;
}
export interface SuggestionsResponse {
  success: boolean;
  data: { settlements: SuggestedSettlement[] };
}
export interface SettlementPayment {
  _id: string;
  groupId: string;
  from: BalanceUser | null;
  to: BalanceUser | null;
  recordedBy: BalanceUser | null;
  amount: number;
  paidAt: string;
  createdAt: string;
  requestId?: string;
}
export interface SettlementHistoryResponse {
  success: boolean;
  data: { settlements: SettlementPayment[] };
  pagination: Pick<Pagination, 'page' | 'limit' | 'total' | 'totalPages'>;
}
export interface RecordSettlementPayload {
  to: string;
  amount: number;
  paidAt: string;
  requestId: string;
}
export interface RecordSettlementResponse {
  success: boolean;
  message?: string;
  data: {
    settlement: Omit<SettlementPayment, 'from' | 'to' | 'recordedBy'> & {
      from: string;
      to: string;
      recordedBy: string;
    };
  };
}
