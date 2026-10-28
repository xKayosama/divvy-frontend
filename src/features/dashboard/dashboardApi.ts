import { api } from '@/services/api';

import type { DashboardResponse } from './types';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, string>({
      query: (groupId) => `/groups/${groupId}/dashboard`,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
