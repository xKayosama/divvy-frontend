export type SplitType =
  'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES' | 'ITEMIZED';
export type StandardSplitType = Exclude<SplitType, 'ITEMIZED'>;
export type Frequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export interface SplitParticipant {
  userId: string;
  amount?: number;
  percentage?: number | null;
  shares?: number | null;
}
export interface ExpenseItem {
  description: string;
  quantity: number;
  amount: number;
  memberIds: string[];
}
export interface Adjustment {
  amount: number;
  allocation: 'EQUAL' | 'PROPORTIONAL';
}
export type Adjustments = { tax?: Adjustment; tip?: Adjustment };
export const splitLabels: Record<SplitType, string> = {
  EQUAL: 'Equally',
  EXACT: 'By amount',
  PERCENTAGE: 'By percent',
  SHARES: 'By shares',
  ITEMIZED: 'By item',
};
