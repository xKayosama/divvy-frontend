import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Login from './pages/Login';
import GroupsPage from './features/groups/pages/GroupsPage';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import { lazy, Suspense } from 'react';
import AppShell from './components/shell/AppShell';

const BillsPage = lazy(() => import('./features/bills/pages/BillsPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/groups" element={<GroupsPage />} />
          <Route
            path="/households"
            element={<Navigate to="/groups" replace />}
          />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route
              path="/bills"
              element={
                <Suspense
                  fallback={
                    <p role="status" className="p-6 text-muted-foreground">
                      Loading bills…
                    </p>
                  }
                >
                  <BillsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/groups" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
