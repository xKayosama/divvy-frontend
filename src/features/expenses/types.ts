import type { UserSummary } from '@/types/user';
import type { Pagination } from '@/types/api';
import type {
  SplitType,
  ExpenseItem,
  Adjustments,
  Frequency,
} from '@/lib/finance/types';
export type {
  ExpenseItem,
  Adjustment,
  Adjustments,
  Frequency,
} from '@/lib/finance/types';
export const expenseCategories = [
  'FOOD',
  'RENT',
  'UTILITIES',
  'INTERNET',
  'TRANSPORTATION',
  'GROCERIES',
  'HEALTHCARE',
  'ENTERTAINMENT',
  'SHOPPING',
  'COFFEE',
  'TRAVEL',
  'ACCOMMODATION',
  'FUEL',
  'PARKING',
  'EDUCATION',
  'PETS',
  'GIFTS',
  'HOME_MAINTENANCE',
  'PERSONAL_CARE',
  'FITNESS',
  'SUBSCRIPTIONS',
  'OTHERS',
] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];
export type ExpenseSplitType = SplitType;
export type ExpenseSort = 'newest' | 'oldest' | 'amount_high' | 'amount_low';
export type ExpenseUser = UserSummary;
export interface ExpenseParticipant {
  userId: string | ExpenseUser;
  amount: number;
  percentage?: number | null;
  shares?: number | null;
}
export interface Expense {
  _id: string;
  groupId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: ExpenseUser | null;
  splitType: ExpenseSplitType;
  participants: ExpenseParticipant[];
  items?: ExpenseItem[];
  adjustments?: Adjustments;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  billId?: string | null;
  recurrenceSourceId?: string | null;
  recurring?: {
    frequency: Frequency;
    anchor: string;
    endDate: string | null;
    paused: boolean;
    nextDate: string | null;
    lastError: string;
  };
}
export interface ExpensePayload {
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;
  splitType: ExpenseSplitType;
  participants?: {
    userId: string;
    amount?: number;
    percentage?: number | null;
    shares?: number | null;
  }[];
  items?: ExpenseItem[];
  adjustments?: Adjustments;
  date?: string;
  notes?: string;
  recurring?: { frequency: Frequency; endDate?: string | null };
}
export type ExpensePagination = Pagination;
export interface ExpensesResponse {
  success: boolean;
  message: string;
  data: { expenses: Expense[] };
  pagination: ExpensePagination;
}
