import { Brand } from '@/components/brand/Brand';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Scale,
  Settings,
  Users,
  X,
} from 'lucide-react';

import { useAppDispatch } from '@/app/hooks';

import { useLogoutSessionMutation } from '@/features/auth/authApi';
import { logout } from '@/features/auth/authSlice';
import { useState } from 'react';
import { clearSelectedHousehold } from '@/features/household/householdSlice';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const navigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: Receipt,
  },
  {
    label: 'Bills',
    path: '/bills',
    icon: FileText,
  },
  {
    label: 'Members',
    path: '/members',
    icon: Users,
  },
  {
    label: 'Balances',
    path: '/balances',
    icon: Scale,
  },
  {
    label: 'Settlements',
    path: '/settlements',
    icon: ArrowLeftRight,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [endSession, { isLoading: signingOut }] = useLogoutSessionMutation();
  const [logoutError, setLogoutError] = useState('');
  const handleLogout = async () => {
    setLogoutError('');
    try {
      await endSession().unwrap();
    } catch (error) {
      if (!(
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 401
      )) {
        setLogoutError('Sign out failed. Please try again.');
        return;
      }
    }
    dispatch(logout());
    dispatch(clearSelectedHousehold());

    onClose();

    navigate('/login', {
      replace: true,
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-black/5 bg-white shadow-xl transition-transform duration-300 ease-out',
          'lg:static lg:z-auto lg:translate-x-0 lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 lg:px-6">
          <Brand />

          {/* Mobile Close */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl text-muted-foreground lg:hidden"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
          <Label
            htmlFor="Main"
            className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] uppercase"
          >
            Main
          </Label>

          <NavLink
            to="/groups"
            onClick={onClose}
            className="mb-4 rounded-xl border px-3 py-2 text-sm font-medium text-primary"
          >
            All groups
          </NavLink>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={[
                          'size-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-accent'
                            : 'text-muted-foreground group-hover:text-primary',
                        ].join(' ')}
                        strokeWidth={1.8}
                      />

                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Account */}
          <div className="mt-auto border-t border-border pt-4">
            <Label
              htmlFor="Account"
              className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] uppercase"
            >
              Account
            </Label>

            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                ].join(' ')
              }
            >
              <Settings
                className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                strokeWidth={1.8}
              />

              <span>Settings</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="group mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut
                className="size-4 text-muted-foreground transition-colors group-hover:text-red-500"
                strokeWidth={1.8}
              />

              <span>{signingOut ? 'Signing out…' : 'Logout'}</span>
            </button>
            {logoutError && (
              <p role="alert" className="px-3 text-xs text-destructive">
                {logoutError}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
