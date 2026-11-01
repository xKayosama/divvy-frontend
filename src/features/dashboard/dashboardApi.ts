import { api } from '@/services/api';

import type { DashboardResponse, SpendingPeriod } from './types';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<
      DashboardResponse,
      { groupId: string; period: SpendingPeriod }
    >({
      query: ({ groupId, period }) => ({
        url: `/groups/${groupId}/dashboard`,
        params: { period },
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
