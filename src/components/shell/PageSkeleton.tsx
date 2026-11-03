import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentSkeleton } from './ContentSkeleton';
import { navigation } from './navigation';

export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="flex flex-col gap-6"
    >
      <span className="sr-only">Loading dashboard…</span>
      <SummarySkeleton />
      <Skeleton className="h-56 w-full rounded-2xl" />
      {[0, 1].map((row) => (
        <div key={row} aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((card) => (
        <div
          key={card}
          className="flex flex-col gap-5 rounded-2xl border bg-card p-5"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
      ))}
    </div>
  );
}

function RouteContentSkeleton({ path }: { path: string }) {
  if (path === '/dashboard') {
    return (
      <>
        <Skeleton className="h-5 w-full" />
        <DashboardSkeleton />
      </>
    );
  }
  if (path === '/group-settings') {
    return <ContentSkeleton label="Loading settings…" layout="form" />;
  }
  if (path === '/settlements') {
    return (
      <>
        <ContentSkeleton label="Loading suggested repayments…" />
        <ContentSkeleton label="Loading payment history…" />
      </>
    );
  }
  if (path === '/invitations') {
    return (
      <>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <ContentSkeleton label="Loading invitations…" />
      </>
    );
  }
  return (
    <>
      {['/expenses', '/bills', '/balances'].includes(path) && (
        <SummarySkeleton />
      )}
      {path === '/bills' && <Skeleton className="h-32 w-full rounded-2xl" />}
      <Skeleton className="h-16 w-full rounded-xl" />
      <ContentSkeleton label="Loading records…" />
    </>
  );
}

export function PageSkeleton() {
  const { pathname } = useLocation();
  const groups = pathname === '/groups' || pathname === '/households';
  const auth = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);
  if (auth) {
    return (
      <main
        aria-busy="true"
        className="grid min-h-svh place-items-center bg-background p-6"
      >
        <div className="w-full max-w-sm">
          <ContentSkeleton label="Loading account form…" layout="form" />
        </div>
      </main>
    );
  }
  return (
    <div
      role="status"
      aria-label="Loading your page…"
      aria-busy="true"
      className="flex h-dvh overflow-hidden bg-background"
    >
      <span className="sr-only">Loading your page…</span>
      {!groups && (
        <aside
          aria-hidden="true"
          className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex"
        >
          <div className="flex h-16 items-center border-b px-4">
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="mb-1 h-4 w-12" />
            {navigation.map((item) => (
              <Skeleton key={item.path} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden="true"
          className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-5"
        >
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-28" />
        </div>
        <main
          className={
            groups
              ? 'mx-auto w-full max-w-6xl overflow-y-auto px-5 py-10 sm:px-8 sm:py-16'
              : 'min-w-0 flex-1 overflow-y-auto px-5 py-3 sm:px-8 sm:py-5 lg:px-12 lg:py-6'
          }
        >
          <div className="flex flex-col gap-6 pb-6">
            <div
              aria-hidden="true"
              className="flex flex-wrap items-end justify-between gap-4"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-52" />
                <Skeleton className="h-5 w-full max-w-lg" />
              </div>
              <Skeleton className="h-11 w-40" />
            </div>
            {groups ? (
              <>
                <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-10 w-full" />
                <ContentSkeleton label="Loading your groups…" layout="cards" />
              </>
            ) : (
              <RouteContentSkeleton path={pathname} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
