import { useState } from 'react';
import { Check, ChevronDown, Home, LoaderCircle } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSelectedGroup } from '@/features/groups/groupSlice';
import { useGetGroupsQuery } from '@/features/groups/groupApi';

const GroupSelector = () => {
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const selectedGroup = useAppSelector((state) => state.groups.selectedGroup);

  const { data, isLoading, isError } = useGetGroupsQuery();

  const groups = data?.data.groups ?? [];

  const handleSelectGroup = (group: (typeof groups)[number]) => {
    dispatch(setSelectedGroup(group));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-secondary"
      >
        {/* Icon */}
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Home className="size-4" strokeWidth={1.8} />
        </span>

        {/* Group Name */}
        <div className="hidden text-left sm:block">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            Group
          </p>

          <div className="flex items-center gap-1">
            <p className="max-w-48 truncate text-sm font-semibold text-foreground">
              {selectedGroup?.name ?? 'Select Group'}
            </p>

            <ChevronDown
              className={[
                'size-3.5 text-muted-foreground transition-transform',
                isOpen ? 'rotate-180' : '',
              ].join(' ')}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Mobile Chevron */}
        <ChevronDown
          className={[
            'size-4 text-muted-foreground transition-transform sm:hidden',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg"
          role="menu"
        >
          {/* Header */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
              Your Groups
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose where you want to manage expenses.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />

              <span>Loading groups...</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-destructive">
                Failed to load groups.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Please try again later.
              </p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && groups.length === 0 && (
            <div className="px-4 py-6 text-center">
              <Home className="mx-auto size-5 text-muted-foreground/50" />

              <p className="mt-2 text-sm font-medium text-foreground">
                No groups found.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Create or join a group to get started.
              </p>
            </div>
          )}

          {/* Group List */}
          {!isLoading && !isError && groups.length > 0 && (
            <div className="max-h-72 overflow-y-auto p-2">
              {groups.map((group) => {
                const isSelected = selectedGroup?.id === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectGroup(group)}
                    className={[
                      'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                      isSelected ? 'bg-secondary' : 'hover:bg-muted',
                    ].join(' ')}
                  >
                    {/* Icon */}
                    <span
                      className={[
                        'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      <Home className="size-4" strokeWidth={1.8} />
                    </span>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={[
                          'truncate text-sm font-semibold',
                          isSelected
                            ? 'text-secondary-foreground'
                            : 'text-foreground',
                        ].join(' ')}
                      >
                        {group.name}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {group.currency}
                      </p>
                    </div>

                    {/* Selected */}
                    {isSelected && (
                      <Check
                        className="size-4 shrink-0 text-primary"
                        strokeWidth={2.2}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupSelector;
