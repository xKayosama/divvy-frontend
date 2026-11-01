export type SpendingPeriod = 'all_time' | 'this_month' | 'last_month';
export interface DashboardPeriod {
  value: SpendingPeriod;
  timeZone: 'UTC';
  startDate: string | null;
  endDate: string | null;
}
export interface SpendingCategory {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}
export interface SpendingComparison {
  timeZone: 'UTC';
  basis: 'calendar_month';
  current: {
    startDate: string;
    endDate: string;
    amount: number;
    isInProgress: boolean;
  };
  previous: { startDate: string; endDate: string; amount: number };
  difference: number;
  percentageChange: number | null;
  direction: 'increase' | 'decrease' | 'unchanged';
}
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
  groupId: string;
  description: string;
  amount: number;
  category: string;
  paidBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
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
    period: DashboardPeriod;
    spendingByCategory: SpendingCategory[];
    spendingComparison: SpendingComparison | null;
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
