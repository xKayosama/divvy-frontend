import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProfileDialog from './ProfileDialog';
import { useSignOut } from '../hooks/useSignOut';

export default function AccountMenu() {
  const user = useAppSelector((state) => state.auth.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut, isLoading, error } = useSignOut();
  const name = user ? `${user.firstName} ${user.lastName}` : 'Your account';

  return (
    <>
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          if (!isLoading) setMenuOpen(open);
        }}
      >
        <DropdownMenuTrigger
          aria-label="Open account menu"
          title="Profile and account options"
          render={
            <Button
              variant="outline"
              className="h-auto shrink-0 gap-1 px-2 py-1.5"
            />
          }
        >
          <span className="hidden min-w-0 text-right sm:block">
            <span className="block max-w-40 truncate font-semibold">
              {name}
            </span>
            <span className="block text-xs text-muted-foreground">
              Your account
            </span>
          </span>
          <Avatar className="size-9" aria-hidden="true">
            <AvatarImage src={user?.avatar ?? undefined} alt="" />
            <AvatarFallback>
              {user?.firstName?.charAt(0).toUpperCase() || <UserCircle />}
            </AvatarFallback>
          </Avatar>
          <ChevronDown data-icon="inline-end" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 max-w-[calc(100vw-2rem)] p-2"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 py-2">
              <span className="block truncate text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="gap-3 rounded-lg px-3 py-2.5"
              disabled={isLoading}
              onClick={() => setProfileOpen(true)}
            >
              <UserCircle /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="gap-3 rounded-lg px-3 py-2.5"
              closeOnClick={false}
              disabled={isLoading}
              onClick={() => void signOut()}
            >
              <LogOut /> {isLoading ? 'Signing out…' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {error && (
            <p role="alert" className="px-2 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {profileOpen && user && (
        <ProfileDialog user={user} onClose={() => setProfileOpen(false)} />
      )}
    </>
  );
}
