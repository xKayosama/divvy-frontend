import type {
  ExpensePagination,
  ExpenseUser,
  Frequency,
  ExpensePayload,
} from '@/features/expenses/types';
export const billCategories = [
  'RENT',
  'ELECTRICITY',
  'WATER',
  'INTERNET',
  'PHONE',
  'SUBSCRIPTION',
  'INSURANCE',
  'GAS',
  'ASSOCIATION_DUES',
  'EDUCATION',
  'CHILDCARE',
  'LOAN',
  'CREDIT_CARD',
  'PROPERTY_TAX',
  'MAINTENANCE',
  'OTHER',
] as const;
export type BillCategory = (typeof billCategories)[number];
export type BillStatus = 'PENDING' | 'OVERDUE' | 'PAID';
export type BillView = 'upcoming' | 'history';
export type BillSort =
  'due_soonest' | 'due_latest' | 'amount_high' | 'amount_low';
export interface Bill {
  _id: string;
  groupId: string;
  name: string;
  amount: number;
  category: BillCategory;
  dueDate: string;
  isRecurring: boolean;
  recurrence: Frequency | null;
  recurrenceSourceId?: string | null;
  occurrenceNumber?: number;
  status: BillStatus;
  paidBy: ExpenseUser | null;
  paidAt: string | null;
  expenseId: string | null;
  paymentPending: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
export interface BillPayload {
  name: string;
  amount: number;
  category: BillCategory;
  dueDate: string;
  isRecurring: boolean;
  recurrence: Frequency | null;
  notes: string;
}
export interface BillsResponse {
  success: boolean;
  data: { bills: Bill[] };
  pagination: ExpensePagination;
}
export interface ReminderBucket {
  count: number;
  amount: number;
  bills: Bill[];
}
export interface BillOverview {
  data: {
    bills: {
      total: number;
      pending: number;
      overdue: number;
      paid: number;
      pendingAmount: number;
      overdueAmount: number;
      paidAmount: number;
    };
    billReminders: {
      asOf: string;
      timeZone: 'UTC';
      windowDays: number;
      overdue: ReminderBucket;
      dueToday: ReminderBucket;
      dueSoon: ReminderBucket;
    };
  };
}
export type PaymentSplit = Exclude<ExpensePayload['splitType'], 'ITEMIZED'>;
export type PaymentPayload =
  | { resume: true }
  | {
      paidBy: string;
      splitType: PaymentSplit;
      participants: NonNullable<ExpensePayload['participants']>;
    };
