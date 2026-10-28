import { api } from '@/services/api';
import type { Household } from '@/features/household/householdApi';
export type Group = Household;
export const groupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query<
      { success: boolean; data: { groups: Group[] } },
      void
    >({
      query: () => '/groups',
      providesTags: ['Household'],
    }),
    createGroup: builder.mutation<
      { data: { group: { _id: string } } },
      { name: string; currency: string }
    >({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: ['Household'],
    }),
  }),
});
export const { useGetGroupsQuery, useCreateGroupMutation } = groupApi;
