import { api } from '@/services/api';

import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  MeResponse,
} from './types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    logoutSession: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLogoutSessionMutation,
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
} = authApi;
