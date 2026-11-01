import { api } from '@/services/api';
export interface GroupDetails {
  id: string;
  name: string;
  currency: string;
  icon: string;
  canChangeCurrency: boolean;
  ownerId: string;
  role: string;
}
export interface DeletedGroup {
  id: string;
  name: string;
  currency: string;
  deletedAt: string;
}
export interface ActivityEntry {
  _id: string;
  actor: { firstName?: string; lastName?: string } | null;
  action: string;
  label: string;
  occurredAt: string;
  changes?: Record<string, { before?: unknown; after?: unknown }>;
}
const tags = [
  'Group',
  'Dashboard',
  'Expense',
  'Bill',
  'Balance',
  'Settlement',
  'Member',
  'Invitation',
] as const;
export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroupSettings: builder.query<{ data: { group: GroupDetails } }, string>({
      query: (id) => `/groups/${id}`,
      providesTags: ['Group'],
    }),
    updateGroupSettings: builder.mutation<
      { data: { group: { name: string; currency: string } } },
      { id: string; name: string; currency: string; icon: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [...tags],
    }),
    softDeleteGroup: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/groups/${id}/soft-delete`, method: 'POST' }),
      invalidatesTags: [...tags],
    }),
    getDeletedGroups: builder.query<{ data: { groups: DeletedGroup[] } }, void>(
      {
        query: () => '/groups/deleted',
        providesTags: ['Group'],
      },
    ),
    restoreGroup: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/groups/${id}/restore`, method: 'POST' }),
      invalidatesTags: [...tags],
    }),
    getGroupActivity: builder.query<
      {
        data: {
          activities: ActivityEntry[];
          pagination: { page: number; totalPages: number; total: number };
        };
      },
      { id: string; page: number }
    >({
      query: ({ id, page }) => ({
        url: `/groups/${id}/activity`,
        params: { page, limit: 20 },
      }),
      providesTags: ['Group', 'Expense', 'Bill'],
    }),
  }),
});
export const {
  useGetGroupSettingsQuery,
  useUpdateGroupSettingsMutation,
  useSoftDeleteGroupMutation,
  useGetDeletedGroupsQuery,
  useRestoreGroupMutation,
  useGetGroupActivityQuery,
} = settingsApi;
