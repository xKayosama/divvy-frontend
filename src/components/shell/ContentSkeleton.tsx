import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ContentSkeleton({
  label,
  layout = 'list',
}: {
  label: string;
  layout?: 'list' | 'cards' | 'form';
}) {
  return (
    <div role="status" aria-label={label} className="w-full">
      <span className="sr-only">{label}</span>
      {layout === 'form' ? (
        <div aria-hidden="true" className="flex flex-col gap-6 rounded-2xl border bg-card p-5">
          <Skeleton className="h-6 w-40" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
          <Skeleton className="h-11 w-32" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            layout === 'cards'
              ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4 p-5',
          )}
        >
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex min-w-0 items-center gap-4 rounded-xl border bg-card p-5">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full max-w-64" />
                {layout === 'cards' && <Skeleton className="mt-3 h-4 w-24 max-w-full" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
