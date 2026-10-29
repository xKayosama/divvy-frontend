import AccountMenu from '@/features/auth/components/AccountMenu';

import { SidebarTrigger } from '@/components/ui/sidebar';
import GroupSelector from '@/features/groups/components/GroupSelector';

const Header = () => {
  return (
    <header className="relative flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-4 lg:px-5">
      <SidebarTrigger aria-label="Toggle navigation" />

      {/* Group */}
      <div className="min-w-0 flex-1">
        <div className="w-fit max-w-full">
          <GroupSelector />
        </div>
      </div>

      <AccountMenu />
    </header>
  );
};

export default Header;
