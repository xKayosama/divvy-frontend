import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import AppShell from '@/components/shell/AppShell';
import { PageSkeleton } from '@/components/shell/PageSkeleton';
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const PasswordResetPage = lazy(
  () => import('@/features/auth/pages/PasswordResetPage'),
);
const NotificationsPage = lazy(
  () => import('@/features/notifications/pages/NotificationsPage'),
);
const GroupsPage = lazy(() => import('@/features/groups/pages/GroupsPage'));
const DashboardPage = lazy(
  () => import('@/features/dashboard/pages/DashboardPage'),
);
const ExpensesPage = lazy(
  () => import('@/features/expenses/pages/ExpensesPage'),
);
const BillsPage = lazy(() => import('@/features/bills/pages/BillsPage'));
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage'));
const InvitationsPage = lazy(
  () => import('@/features/members/pages/InvitationsPage'),
);
const BalancesPage = lazy(
  () => import('@/features/balances/pages/BalancesPage'),
);
const SettlementsPage = lazy(
  () => import('@/features/settlements/pages/SettlementsPage'),
);
const GroupSettingsPage = lazy(
  () => import('@/features/groups/pages/GroupSettingsPage'),
);
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/forgot-password"
            element={<PasswordResetPage key="request" />}
          />
          <Route
            path="/reset-password"
            element={<PasswordResetPage key="reset" initialStep="reset" />}
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/groups" element={<GroupsPage />} />
            <Route
              path="/households"
              element={<Navigate to="/groups" replace />}
            />
            <Route element={<AppShell />}>
              <Route path="/group-settings" element={<GroupSettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/bills" element={<BillsPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/invitations" element={<InvitationsPage />} />
              <Route path="/balances" element={<BalancesPage />} />
              <Route path="/settlements" element={<SettlementsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
