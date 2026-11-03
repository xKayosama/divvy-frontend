import { api } from '@/services/api';
import { normalizeAuthUser, type AuthUserResponse } from './lib/auth-user';

import type {
  AuthResponse,
  RegisterResponse,
  AuthMessageResponse,
  ResetPasswordRequest,
  RegisterRequest,
  LoginRequest,
  MeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from './types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    logoutSession: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    requestPasswordReset: builder.mutation<
      AuthMessageResponse,
      { email: string }
    >({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<AuthMessageResponse, ResetPasswordRequest>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Omit<AuthResponse, 'data'> & {
        data: { token: string; user: AuthUserResponse };
      }) => ({
        ...response,
        data: { ...response.data, user: normalizeAuthUser(response.data.user) },
      }),
    }),

    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest
    >({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      invalidatesTags: (result) =>
        result
          ? [
              'Auth',
              'Group',
              'Member',
              'Dashboard',
              'Expense',
              'Bill',
              'Balance',
              'Settlement',
            ]
          : [],
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
      transformResponse: (response: Omit<MeResponse, 'data'> & {
        data: { user: AuthUserResponse };
      }) => ({
        ...response,
        data: { ...response.data, user: normalizeAuthUser(response.data.user) },
      }),
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLogoutSessionMutation,
  useRegisterMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
} = authApi;
