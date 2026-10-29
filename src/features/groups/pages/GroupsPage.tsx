import { Brand } from '@/components/brand/Brand';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, Users, Wallet } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSelectedGroup } from '@/features/groups/groupSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LogoutButton from '@/features/auth/components/LogoutButton';
import CreateGroupDialog from '../components/CreateGroupDialog';
import { useGetGroupsQuery } from '../groupApi';

export default function GroupsPage() {
  const { data, isLoading, isError, refetch } = useGetGroupsQuery();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const groups = data?.data.groups ?? [];
  const visible = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main className="min-h-svh bg-background bg-brand-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Brand />
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">
              Your shared spaces
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Hey{user?.firstName ? `, ${user.firstName}` : ''}. Let’s split
              life.
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              A home, a weekend away, or everyday plans. Keep everyone’s
              expenses together.
            </p>
          </div>
          <CreateGroupDialog />
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border bg-white p-5">
            <Users className="size-6 text-primary" />
            <div>
              <p className="text-2xl font-semibold">{groups.length}</p>
              <p className="text-sm text-muted-foreground">Your groups</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-brand-spending p-5 text-white">
            <Wallet className="size-6 text-[#A1E8CD]" />
            <div>
              <p className="font-medium">More clarity. Less chasing.</p>
              <p className="mt-1 text-sm text-white/70">
                Open a group to see expenses and who owes what.
              </p>
            </div>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">All groups</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              aria-label="Search groups"
              className="h-10 bg-white pl-9"
              placeholder="Find a group…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <p
            role="status"
            className="rounded-2xl border bg-white p-10 text-center"
          >
            Loading your groups…
          </p>
        ) : isError ? (
          <div
            role="alert"
            className="rounded-2xl border bg-white p-10 text-center"
          >
            <p className="mb-4">We couldn’t load your groups.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
            <Users className="mx-auto mb-4 size-10 text-primary" />
            <h3 className="text-xl font-semibold">
              {search ? 'No matching groups' : 'Good things start with a group'}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {search
                ? 'Try another name.'
                : 'Create a space and start tracking shared expenses.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((group) => (
              <Button
                variant="outline"
                key={group.id}
                onClick={() => {
                  dispatch(setSelectedGroup(group));
                  navigate('/dashboard');
                }}
                className="group block h-auto w-full rounded-2xl p-6 text-left whitespace-normal shadow-sm"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                    <Users className="size-6" />
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                    {group.role === 'OWNER' ? 'Owner' : 'Member'}
                  </span>
                </div>
                <h3 className="truncate text-xl font-semibold">{group.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {group.currency} · Shared expenses
                </p>
                <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm font-medium text-primary">
                  Open group
                  <ArrowUpRight className="size-5 transition group-hover:translate-x-1" />
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
