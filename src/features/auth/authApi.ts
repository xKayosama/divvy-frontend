import { api } from '../../services/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role?: string | null;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface MeResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

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
