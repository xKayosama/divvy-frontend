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

const profileTags = [
  'Auth', 'Group', 'Member', 'Dashboard', 'Expense', 'Bill', 'Balance', 'Settlement',
] as const;

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

    verifyEmail: builder.mutation<
      AuthMessageResponse,
      { email: string; code: string }
    >({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
    }),
    resendVerification: builder.mutation<
      AuthMessageResponse,
      { email: string }
    >({
      query: (body) => ({
        url: '/auth/resend-verification',
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
      transformResponse: (
        response: Omit<AuthResponse, 'data'> & {
          data: { token: string; user: AuthUserResponse };
        },
      ) => ({
        ...response,
        data: { ...response.data, user: normalizeAuthUser(response.data.user) },
      }),
    }),

    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest
    >({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      invalidatesTags: (result) => (result ? profileTags : []),
    }),
    updateAvatar: builder.mutation<UpdateProfileResponse, File | null>({
      query: (file) => {
        if (!file) return { url: '/auth/me/avatar', method: 'DELETE' };
        const body = new FormData();
        body.set('avatar', file);
        return { url: '/auth/me/avatar', method: 'PUT', body };
      },
      invalidatesTags: (result) => (result ? profileTags : []),
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
      transformResponse: (
        response: Omit<MeResponse, 'data'> & {
          data: { user: AuthUserResponse };
        },
      ) => ({
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
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
} = authApi;
