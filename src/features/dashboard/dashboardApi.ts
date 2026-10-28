import { api } from '@/services/api';

export interface DashboardBalance {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  paid: number;
  owed: number;
  net: number;
}

export interface ExpenseParticipants {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  percentage: number | null;
}

export interface DashboardExpense {
  _id: string;
  householdId: string;
  description: string;
  amount: number;
  category: string;
  paidBy: {
    _id: string;
    firstName: string;
    lastName: string;
    emailL: string;
    avatar: string;
  };
  splitType: string;
  participants: ExpenseParticipants[];
  date: string;
  notes: string;
}

export interface DashboardBill {
  _id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  status: string;
}

export interface DashboardResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    summary: {
      totalExpenses: number;
      totalPaid: number;
      totalOwed: number;
    };
    balances: DashboardBalance[];
    bills: {
      total: number;
      pending: number;
      overdue: number;
      paid: number;
      pendingAmount: number;
      overdueAmount: number;
      paidAmount: number;
    };
    recentExpenses: DashboardExpense[];
    upcomingBills: DashboardBill[];
  };
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, string>({
      query: (householdId) => `/groups/${householdId}/dashboard`,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
