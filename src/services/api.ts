import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',

  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery: async (args, context, options) => {
    const requestToken = localStorage.getItem('token');
    const result = await rawBaseQuery(args, context, options);
    if (
      result.error?.status === 401 &&
      requestToken &&
      requestToken === localStorage.getItem('token')
    ) {
      context.dispatch({ type: 'auth/logout' });
    }
    return result;
  },

  tagTypes: [
    'Auth',
    'Household',
    'Member',
    'Expense',
    'Bill',
    'Balance',
    'Settlement',
    'Dashboard',
  ],

  endpoints: () => ({}),
});
