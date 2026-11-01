import { LoaderCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
export default function ReceiptScanProgress({
  preparing,
}: {
  preparing: boolean;
}) {
  return (
    <Card
      tone="mint"
      className="gap-4 py-5"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <CardContent className="px-5" aria-hidden="true">
        <div className="relative mx-auto flex h-32 w-28 flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4">
          <Skeleton className="h-2 w-12 motion-reduce:animate-none" />
          <Skeleton className="h-2 w-full motion-reduce:animate-none" />
          <Skeleton className="h-2 w-14 motion-reduce:animate-none" />
          <Skeleton className="mt-auto h-2 w-full motion-reduce:animate-none" />
          <div className="absolute inset-x-0 top-2 h-0.5 bg-primary motion-safe:animate-[receipt-scan_1.8s_ease-in-out_infinite]" />
        </div>
      </CardContent>
      <CardHeader className="items-center gap-2 px-5 text-center">
        <CardTitle className="flex items-center gap-2">
          <LoaderCircle
            className="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          {preparing ? 'Preparing your photo' : 'Scanning your receipt'}
        </CardTitle>
        <CardDescription>
          {preparing
            ? 'Optimizing the image for a faster scan.'
            : 'Reading the receipt and finding its items and totals. This may take up to a minute.'}{' '}
          You can cancel at any time.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
