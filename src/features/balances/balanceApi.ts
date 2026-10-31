import { api } from '@/services/api';
import type { BalancesResponse } from './types';
export const balanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBalances: builder.query<BalancesResponse, string>({
      query: (id) => `/groups/${id}/balances`,
      providesTags: ['Balance'],
    }),
  }),
});
export const { useGetBalancesQuery } = balanceApi;
