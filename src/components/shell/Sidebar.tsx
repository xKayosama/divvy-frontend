import { useSidebar } from '@/components/ui/sidebar-context';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Brand } from '@/components/brand/Brand';
import { Button } from '@/components/ui/button';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { navigation } from './navigation';

const Sidebar = () => {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const closeMobile = () => setOpenMobile(false);

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="h-16 flex-row items-center justify-between gap-2 border-b border-sidebar-border px-3 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2.5">
        <span className="group-data-[collapsible=icon]:hidden">
          <Brand />
        </span>
        <img
          src="/brand/icon.png"
          alt="Divvy"
          className="hidden size-11 shrink-0 object-contain group-data-[collapsible=icon]:block"
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close navigation"
          onClick={closeMobile}
          className="md:hidden"
        >
          <X />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:w-auto">
            <nav aria-label="Main navigation">
              <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-3">
                {navigation.map(({ path, label, icon: Icon }) => (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      size="lg"
                      tooltip={label}
                      aria-label={label}
                      isActive={
                        pathname === path || pathname.startsWith(`${path}/`)
                      }
                      render={<NavLink to={path} onClick={closeMobile} />}
                    >
                      <Icon strokeWidth={1.8} />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
};

export default Sidebar;
