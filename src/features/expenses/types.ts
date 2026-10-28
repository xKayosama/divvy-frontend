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
export type ExpenseSplitType =
  'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES' | 'ITEMIZED';
export type ExpenseSort = 'newest' | 'oldest' | 'amount_high' | 'amount_low';
export interface ExpenseUser {
  _id: string;
  firstName: string;
  lastName: string;
}
export interface ExpenseParticipant {
  userId: string | ExpenseUser;
  amount: number;
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
export type Frequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
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
export interface ExpensePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
export interface ExpensesResponse {
  success: boolean;
  message: string;
  data: { expenses: Expense[] };
  pagination: ExpensePagination;
}
export const categoryLabel = (category: string) =>
  category
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
export const splitLabels: Record<ExpenseSplitType, string> = {
  EQUAL: 'Equally',
  EXACT: 'By amount',
  PERCENTAGE: 'By percent',
  SHARES: 'By shares',
  ITEMIZED: 'By item',
};
export const participantId = (user: ExpenseParticipant['userId'] | null) =>
  typeof user === 'string' ? user : (user?._id ?? '');
export const personName = (user: ExpenseUser | null | undefined) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : 'Former member';
