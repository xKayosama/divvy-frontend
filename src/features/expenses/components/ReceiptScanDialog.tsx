import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, ScanLine, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { apiMessage } from '@/services/api-error';
import { useScanReceiptMutation } from '../receiptApi';
import { receiptFileError, receiptDraft } from '../lib/receipt-draft';
import type { ScannedReceipt, ReceiptExpenseDraft } from '../receipt-types';
export default function ReceiptScanDialog({
  groupId,
  currency,
  onClose,
  onReview,
}: {
  groupId: string;
  currency: string;
  onClose: () => void;
  onReview: (draft: ReceiptExpenseDraft) => void;
}) {
  const [file, setFile] = useState<File | null>(null),
    [error, setError] = useState(''),
    [result, setResult] = useState<ScannedReceipt | null>(null),
    [reviewed, setReviewed] = useState(false);
  const [scan, state] = useScanReceiptMutation();
  const cameraInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.files?.[0];
    if (!next) return;
    setFile(next);
    setResult(null);
    setReviewed(false);
    setError(receiptFileError(next));
    event.currentTarget.value = '';
  }
  const request = useRef<{ abort: () => void } | null>(null),
    cancelled = useRef(false);
  useEffect(
    () => () => {
      cancelled.current = true;
      request.current?.abort();
    },
    [],
  );
  function close() {
    cancelled.current = true;
    request.current?.abort();
    onClose();
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || request.current) return;
    const invalid = receiptFileError(file);
    setError(invalid);
    if (invalid) return;
    setResult(null);
    setReviewed(false);
    cancelled.current = false;
    const pending = scan({ groupId, file });
    request.current = pending;
    try {
      const response = await pending.unwrap();
      if (cancelled.current) return;
      if (response.data.groupId !== groupId || !response.data.receipt.isReceipt)
        throw new Error('Unexpected receipt response. Please scan again.');
      setResult(response.data.receipt);
    } catch (caught) {
      if (!cancelled.current)
        setError(
          apiMessage(
            caught,
            'Could not scan this receipt. Try a clearer file or enter the expense manually.',
          ),
        );
    } finally {
      request.current = null;
    }
  }
  function review(itemized: boolean) {
    if (!result) return;
    try {
      onReview(receiptDraft(result, currency, itemized, reviewed));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Review the receipt before continuing.',
      );
    }
  }
  const mismatch = !!result?.currency && result.currency !== currency;
  const display = (value: number | null) =>
    value === null
      ? 'Not found'
      : `${value.toLocaleString('en-PH', { maximumFractionDigits: 3 })}${result?.currency ? ` ${result.currency}` : ''}`;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle>Scan a receipt</DialogTitle>
          <DialogDescription>
            Review extracted values before creating an expense in {currency}.
            Nothing is saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
          <form
            onSubmit={submit}
            className="flex flex-col gap-4"
            aria-busy={state.isLoading}
          >
            <Field>
              <FieldLabel>Receipt</FieldLabel>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={state.isLoading}
                  onClick={() => cameraInput.current?.click()}
                  aria-describedby="receipt-camera-help"
                >
                  <Camera data-icon="inline-start" />
                  Take photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={state.isLoading}
                  onClick={() => uploadInput.current?.click()}
                  aria-describedby="receipt-file-help"
                >
                  <Upload data-icon="inline-start" />
                  Upload receipt
                </Button>
              </div>
              <Input
                ref={cameraInput}
                id="receipt-camera"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                tabIndex={-1}
                aria-label="Take a receipt photo"
                disabled={state.isLoading}
                onChange={selectFile}
              />
              <Input
                ref={uploadInput}
                id="receipt-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                tabIndex={-1}
                aria-label="Upload receipt file"
                disabled={state.isLoading}
                onChange={selectFile}
              />
              <FieldDescription id="receipt-camera-help">
                Use your phone’s rear camera where supported, or upload an
                existing receipt.
              </FieldDescription>
              {file && (
                <p role="status" className="break-all text-sm">
                  Selected: {file.name}
                </p>
              )}
              <FieldDescription id="receipt-file-help">
                JPEG, PNG, WebP or PDF · up to 10 MB. PDFs scan at most the
                first three pages. Upload one receipt at a time; the file is
                processed temporarily.
              </FieldDescription>
            </Field>
            <div>
              <Button
                type="submit"
                disabled={!file || !!receiptFileError(file) || state.isLoading}
              >
                {state.isLoading ? (
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <ScanLine data-icon="inline-start" />
                )}
                {state.isLoading
                  ? 'Scanning…'
                  : result
                    ? 'Scan again'
                    : 'Scan receipt'}
              </Button>
            </div>
            {state.isLoading && (
              <p role="status" className="text-sm text-muted-foreground">
                Reading your receipt. This can take up to a minute. Cancel to
                stop the scan.
              </p>
            )}
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <section
              aria-label="Receipt review"
              className="mt-6 flex flex-col gap-5"
            >
              <h3 className="font-semibold">Extracted receipt</h3>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {[
                  ['Merchant', result.merchant ?? 'Not found'],
                  ['Date', result.date ?? 'Not found'],
                  [
                    'Currency',
                    result.currency ?? 'Not found — confirm group currency',
                  ],
                  ['Subtotal', display(result.subtotal)],
                  ['Tax', display(result.tax)],
                  ['Tip', display(result.tip)],
                  ['Total', display(result.total)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              {result.items.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-semibold">Receipt items</h4>
                  <ul className="flex flex-col divide-y rounded-xl border">
                    {result.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex flex-wrap justify-between gap-2 p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="break-words font-medium">
                            {item.description ?? 'Description not found'}
                          </p>
                          <p className="text-muted-foreground">
                            Quantity: {item.quantity ?? 'Not found'} · Unit
                            price: {display(item.unitPrice)}
                          </p>
                        </div>
                        <p>Line total: {display(item.total)}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Item amounts are line totals. Quantities are not multiplied
                    again. Assign each item to people in the expense form.
                  </p>
                </div>
              )}
              <Alert>
                <AlertTitle>Check the extraction</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {[
                      'Compare every value with the original receipt. Missing or unsupported amounts must be entered in the expense form.',
                      ...result.warnings,
                    ].map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
              {mismatch ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    The receipt uses {result.currency}, but this group uses{' '}
                    {currency}. Choose a group with the matching currency or
                    enter a converted expense manually. No conversion is applied
                    here.
                  </AlertDescription>
                </Alert>
              ) : (
                <Field orientation="horizontal">
                  <Checkbox
                    id="receipt-reviewed"
                    checked={reviewed}
                    onCheckedChange={setReviewed}
                  />
                  <FieldLabel htmlFor="receipt-reviewed">
                    I reviewed the extracted values and confirmed the currency
                    is {currency}.
                  </FieldLabel>
                </Field>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={!reviewed || mismatch}
                  onClick={() => review(false)}
                >
                  Review expense
                </Button>
                {result.items.length > 0 && (
                  <Button
                    variant="outline"
                    disabled={!reviewed || mismatch}
                    onClick={() => review(true)}
                  >
                    Review itemized expense
                  </Button>
                )}
              </div>
            </section>
          )}
        </div>
        <div className="flex shrink-0 justify-end border-t px-6 py-4">
          <Button variant="outline" onClick={close}>
            {state.isLoading ? 'Cancel scan' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
