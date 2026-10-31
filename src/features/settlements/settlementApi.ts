import { api } from '@/services/api';
import type {
  SuggestionsResponse,
  SettlementHistoryResponse,
  RecordSettlementPayload,
  RecordSettlementResponse,
} from './types';
export const settlementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSettlementSuggestions: builder.query<SuggestionsResponse, string>({
      query: (id) => `/groups/${id}/settlements`,
      providesTags: ['Settlement'],
    }),
    getSettlementHistory: builder.query<
      SettlementHistoryResponse,
      { groupId: string; page: number; limit: number }
    >({
      query: ({ groupId, ...params }) => ({
        url: `/groups/${groupId}/settlements/history`,
        params,
      }),
      providesTags: ['Settlement'],
    }),
    recordSettlement: builder.mutation<
      RecordSettlementResponse,
      { groupId: string; body: RecordSettlementPayload }
    >({
      query: ({ groupId, body }) => ({
        url: `/groups/${groupId}/settlements`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Balance', 'Settlement', 'Dashboard'],
    }),
  }),
});
export const {
  useGetSettlementSuggestionsQuery,
  useGetSettlementHistoryQuery,
  useRecordSettlementMutation,
} = settlementApi;
