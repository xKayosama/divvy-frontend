import { api } from '@/services/api';

import type {
  MembersResponse,
  InvitationResponse,
  InvitationsResponse,
  CreatedInvitationResponse,
} from './types';

export const memberApi = api.injectEndpoints({
  endpoints: (builder) => ({
    removeGroupMember: builder.mutation<
      { success: boolean },
      { groupId: string; userId: string }
    >({
      query: ({ groupId, userId }) => ({
        url: `/groups/${groupId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        'Member',
        'Group',
        'Invitation',
        'Dashboard',
        'Expense',
        'Bill',
        'Balance',
        'Settlement',
      ],
    }),
    getOutgoingInvitations: builder.query<InvitationsResponse, string>({
      query: (id) => `/groups/${id}/invitations`,
      providesTags: ['Invitation'],
    }),
    createInvitation: builder.mutation<
      CreatedInvitationResponse,
      { groupId: string; email: string }
    >({
      query: ({ groupId, email }) => ({
        url: `/groups/${groupId}/invitations`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Invitation'],
    }),
    revokeInvitation: builder.mutation<
      { success: boolean },
      { groupId: string; invitationId: string; createdAt: string }
    >({
      query: ({ groupId, invitationId, createdAt }) => ({
        url: `/groups/${groupId}/invitations/${invitationId}/revoke`,
        method: 'POST',
        body: { createdAt },
      }),
      invalidatesTags: ['Invitation'],
    }),
    getIncomingInvitations: builder.query<InvitationsResponse, void>({
      query: () => '/invitations',
      providesTags: ['Invitation'],
    }),
    lookupInvitation: builder.mutation<InvitationResponse, { code: string }>({
      query: (body) => ({ url: '/invitations/lookup', method: 'POST', body }),
    }),
    respondToInvitation: builder.mutation<
      InvitationResponse,
      {
        invitationId: string;
        createdAt: string;
        action: 'accept' | 'decline';
        code?: string;
      }
    >({
      query: ({ invitationId, action, ...body }) => ({
        url: `/invitations/${invitationId}/${action}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'Invitation',
        'Group',
        'Member',
        'Dashboard',
        'Balance',
        'Settlement',
      ],
    }),
    getGroupMembers: builder.query<MembersResponse, string>({
      query: (groupId) => `/groups/${groupId}/members`,

      providesTags: ['Member'],
    }),
  }),
});

export const {
  useGetGroupMembersQuery,
  useRemoveGroupMemberMutation,
  useGetOutgoingInvitationsQuery,
  useCreateInvitationMutation,
  useRevokeInvitationMutation,
  useGetIncomingInvitationsQuery,
  useLookupInvitationMutation,
  useRespondToInvitationMutation,
} = memberApi;
