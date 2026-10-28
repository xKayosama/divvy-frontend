import { api } from '@/services/api';

import type { MembersResponse } from './types';

export const memberApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroupMembers: builder.query<MembersResponse, string>({
      query: (groupId) => `/groups/${groupId}/members`,

      providesTags: ['Member'],
    }),
  }),
});

export const { useGetGroupMembersQuery } = memberApi;
