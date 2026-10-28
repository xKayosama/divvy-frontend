import { getStoredToken } from './session';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',

  prepareHeaders: (headers) => {
    const token = getStoredToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery: async (args, context, options) => {
    const requestToken = getStoredToken();
    const result = await rawBaseQuery(args, context, options);
    if (
      result.error?.status === 401 &&
      requestToken &&
      requestToken === getStoredToken()
    ) {
      context.dispatch({ type: 'auth/logout' });
    }
    return result;
  },

  tagTypes: [
    'Auth',
    'Group',
    'Member',
    'Expense',
    'Bill',
    'Balance',
    'Settlement',
    'Dashboard',
  ],

  endpoints: () => ({}),
});
