import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

const AppShell = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header onMenuClick={openSidebar} />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
