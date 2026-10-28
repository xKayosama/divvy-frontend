import { Menu, UserCircle } from 'lucide-react';

import { useAppSelector } from '@/app/hooks';

import HouseholdSelector from '@/features/household/components/HouseholdSelector';

import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/brand/Brand';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="relative flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-4 lg:px-5">
      {/* Mobile Menu */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="shrink-0 rounded-xl text-muted-foreground hover:bg-secondary hover:text-secondary-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </Button>

      <BrandMark />

      {/* Household */}
      <div className="min-w-0 flex-1">
        <HouseholdSelector />
      </div>

      {/* User */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-40 truncate text-sm font-semibold text-foreground">
            {user ? `${user.firstName} ${user.lastName}` : 'User'}
          </p>

          <p className="text-xs text-muted-foreground">Household Member</p>
        </div>

        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="size-9 shrink-0 rounded-full object-cover ring-2 ring-secondary"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {user?.firstName ? (
              user.firstName.charAt(0).toUpperCase()
            ) : (
              <UserCircle className="size-5" />
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
