import { api } from '@/services/api';
import type { InboxResponse } from './types';
const tags = ['Notification', 'Bill', 'Invitation', 'Group'] as const;
export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationInbox: builder.query<
      InboxResponse,
      { accountId: string; page: number }
    >({
      query: ({ page }) => ({ url: '/notifications/inbox', params: { page } }),
      providesTags: [...tags],
    }),
    getNotificationUnreadCount: builder.query<
      { success: boolean; data: { unreadCount: number } },
      string
    >({
      query: () => '/notifications/unread-count',
      providesTags: [...tags],
    }),
    readNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/inbox/${encodeURIComponent(id)}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    readAllNotifications: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/notifications/inbox/read-all', method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});
export const {
  useGetNotificationInboxQuery,
  useGetNotificationUnreadCountQuery,
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
} = notificationApi;
