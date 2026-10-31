import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import AppShell from '@/components/shell/AppShell';
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
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
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <p role="status" className="p-6 text-muted-foreground">
            Loading…
          </p>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/groups" element={<GroupsPage />} />
            <Route
              path="/households"
              element={<Navigate to="/groups" replace />}
            />
            <Route element={<AppShell />}>
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
