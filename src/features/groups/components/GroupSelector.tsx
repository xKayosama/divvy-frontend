import { ChevronsUpDown, LayoutGrid, LoaderCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar-context';
import { useGetGroupsQuery } from '@/features/groups/groupApi';
import { setSelectedGroup } from '@/features/groups/groupSlice';

const GroupSelector = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const selectedGroup = useAppSelector((state) => state.groups.selectedGroup);
  const { data, isLoading, isError, isFetching, refetch } = useGetGroupsQuery();
  const groups = data?.data.groups ?? [];

  return (
    <div className="min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-12 max-w-full justify-start gap-2 px-2"
            />
          }
          aria-label="Switch group"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            {isLoading ? <LoaderCircle className="animate-spin" /> : <Users />}
          </span>
          <span className="grid min-w-0 gap-0.5 text-left">
            <span className="truncate font-semibold">
              {selectedGroup?.name ??
                (isLoading ? 'Loading groups…' : 'Select group')}
            </span>
            <span className="truncate text-xs">
              {selectedGroup?.currency
                ? `${selectedGroup.currency} · Shared expenses`
                : 'Your shared spaces'}
            </span>
          </span>
          <ChevronsUpDown className="ml-1" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="w-56 min-w-48 max-w-[calc(100vw-2rem)] p-2"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Groups</DropdownMenuLabel>
            {isLoading && (
              <DropdownMenuItem disabled>Loading groups…</DropdownMenuItem>
            )}
            {isError && (
              <DropdownMenuItem disabled={isFetching} onClick={() => refetch()}>
                Unable to load groups. Retry
              </DropdownMenuItem>
            )}
            {!isLoading && !isError && groups.length === 0 && (
              <DropdownMenuItem disabled>No groups yet</DropdownMenuItem>
            )}
            <DropdownMenuRadioGroup
              value={selectedGroup?.id ?? ''}
              onValueChange={(id) => {
                const group = groups.find((item) => item.id === id);
                if (group) dispatch(setSelectedGroup(group));
              }}
            >
              {groups.map((group) => (
                <DropdownMenuRadioItem
                  closeOnClick
                  key={group.id}
                  value={group.id}
                  className="gap-3 py-2"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border">
                    <Users aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{group.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="gap-3 py-2"
              onClick={() => {
                setOpenMobile(false);
                navigate('/groups');
              }}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border">
                <LayoutGrid aria-hidden="true" />
              </span>
              All groups
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GroupSelector;
