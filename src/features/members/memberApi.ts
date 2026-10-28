import { api } from '@/services/api';

import type { HouseholdMembersResponse } from './types';

export const memberApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHouseholdMembers: builder.query<
      HouseholdMembersResponse,
      string
    >({
      query: (householdId) =>
        `/groups/${householdId}/members`,

      providesTags: ['Member'],
    }),
  }),
});

export const {
  useGetHouseholdMembersQuery,
} = memberApi;