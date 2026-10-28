import { api } from '@/services/api';
import type {
  Bill,
  BillPayload,
  BillOverview,
  BillsResponse,
  PaymentPayload,
  BillView,
} from './types';
import type { BillFilters } from './lib/bill-state';
import { billQuery } from './lib/bill-state';
const billTags = ['Bill', 'Dashboard'] as const;
const paymentTags = [
  'Bill',
  'Expense',
  'Dashboard',
  'Balance',
  'Settlement',
] as const;
export const billApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query<
      BillsResponse,
      { groupId: string; view: BillView; filters: BillFilters }
    >({
      query: ({ groupId, view, filters }) => ({
        url: `/groups/${groupId}/bills`,
        params: billQuery(view, filters),
      }),
      providesTags: ['Bill'],
    }),
    getBill: builder.query<{ data: { bill: Bill } }, string>({
      query: (id) => `/bills/${id}`,
      providesTags: ['Bill'],
    }),
    getBillOverview: builder.query<BillOverview, string>({
      query: (id) => `/groups/${id}/dashboard`,
      providesTags: billTags,
    }),
    createBill: builder.mutation<
      { data: { bill: Bill } },
      { groupId: string; body: BillPayload }
    >({
      query: ({ groupId, body }) => ({
        url: `/groups/${groupId}/bills`,
        method: 'POST',
        body,
      }),
      invalidatesTags: billTags,
    }),
    updateBill: builder.mutation<
      { data: { bill: Bill } },
      { billId: string; body: BillPayload }
    >({
      query: ({ billId, body }) => ({
        url: `/bills/${billId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: billTags,
    }),
    deleteBill: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/bills/${id}`, method: 'DELETE' }),
      invalidatesTags: billTags,
    }),
    payBill: builder.mutation<
      { data: { bill: Bill; expense: { _id: string; billId: string } } },
      { billId: string; body: PaymentPayload }
    >({
      query: ({ billId, body }) => ({
        url: `/bills/${billId}/pay`,
        method: 'POST',
        body,
      }),
      invalidatesTags: paymentTags,
    }),
  }),
});
export const {
  useGetBillsQuery,
  useGetBillQuery,
  useGetBillOverviewQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  usePayBillMutation,
} = billApi;
