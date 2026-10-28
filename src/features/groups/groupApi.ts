import { api } from '@/services/api';
import type { GroupsResponse } from './types';
export const groupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query<GroupsResponse, void>({
      query: () => '/groups',
      providesTags: ['Group'],
    }),
    createGroup: builder.mutation<
      { data: { group: { _id: string } } },
      { name: string; currency: string }
    >({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: ['Group'],
    }),
  }),
});
export const { useGetGroupsQuery, useCreateGroupMutation } = groupApi;
