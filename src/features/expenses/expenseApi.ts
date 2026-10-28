import { api } from '@/services/api';
import type {
  Expense,
  ExpensePayload,
  ExpenseSort,
  ExpensesResponse,
} from './types';
export interface GetExpensesParams {
  householdId: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
  sort?: ExpenseSort;
}
export type CreateExpenseRequest = ExpensePayload & { householdId: string };
export type UpdateExpenseRequest = Omit<ExpensePayload, 'recurring'> & {
  expenseId: string;
};
const invalidatesTags = [
  'Expense',
  'Balance',
  'Settlement',
  'Dashboard',
] as const;
export const expenseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<ExpensesResponse, GetExpensesParams>({
      query: ({ householdId, ...params }) => ({
        url: `/groups/${householdId}/expenses`,
        params,
      }),
      providesTags: ['Expense'],
    }),
    getExpense: builder.query<{ data: { expense: Expense } }, string>({
      query: (id) => `/expenses/${id}`,
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation<
      { data: { expense: Expense } },
      CreateExpenseRequest
    >({
      query: ({ householdId, ...body }) => ({
        url: `/groups/${householdId}/expenses`,
        method: 'POST',
        body,
      }),
      invalidatesTags,
    }),
    updateExpense: builder.mutation<
      { data: { expense: Expense } },
      UpdateExpenseRequest
    >({
      query: ({ expenseId, ...body }) => ({
        url: `/expenses/${expenseId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags,
    }),
    deleteExpense: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags,
    }),
    updateExpenseRecurrence: builder.mutation<
      { data: { expense: Expense } },
      { expenseId: string; paused?: boolean; endDate?: string | null }
    >({
      query: ({ expenseId, ...body }) => ({
        url: `/expenses/${expenseId}/recurrence`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags,
    }),
  }),
});
export const {
  useGetExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseRecurrenceMutation,
} = expenseApi;
