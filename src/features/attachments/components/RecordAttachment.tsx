import { useRef, useState } from 'react';
import { Download, Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiMessage } from '@/services/api-error';
import { getStoredToken } from '@/services/session';
import {
  attachmentPath,
  useGetRecordAttachmentQuery,
  useUpdateRecordAttachmentMutation,
} from '../attachmentApi';

const fileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const maxBytes = 3 * 1024 * 1024;

export function RecordAttachment({
  kind,
  id,
}: {
  kind: 'bills' | 'expenses';
  id: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const record = { kind, id };
  const query = useGetRecordAttachmentQuery(record, {
    refetchOnMountOrArgChange: true,
  });
  const [update, { isLoading: updating }] = useUpdateRecordAttachmentMutation();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const attachment = query.currentData?.data.attachment;
  const busy = updating || downloading;

  async function change(file: File | null) {
    setError('');
    if (file && (!fileTypes.includes(file.type) || !file.size || file.size > maxBytes)) {
      setError('Choose a JPEG, PNG, WebP, or PDF file up to 3 MB.');
      return;
    }

    try {
      await update({ ...record, file }).unwrap();
    } catch (cause) {
      setError(apiMessage(cause, 'Could not save the attachment. Try again.'));
      void query.refetch();
    }
  }

  async function download() {
    if (!attachment) return;
    setError('');
    setDownloading(true);
    const token = getStoredToken();
    try {
      if (!token) throw new Error('No session');
      const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
      const response = await fetch(`${apiBase}${attachmentPath(record)}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Download failed');
      const file = await response.blob();
      if (token !== getStoredToken()) return;
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Could not download the attachment. Try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border p-4" aria-label="Attachment">
      <div>
        <h3 className="text-sm font-semibold">Attachment</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Visible to active members of this group. One JPEG, PNG, WebP, or PDF up to 3 MB.
        </p>
      </div>
      {query.isError ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">Could not load the attachment.</p>
          <Button variant="outline" onClick={() => void query.refetch()}>Retry</Button>
        </div>
      ) : !query.currentData ? (
        <p role="status" className="text-sm text-muted-foreground">Loading attachment…</p>
      ) : (
        <>
          {attachment && <p className="break-all text-sm font-medium">{attachment.name}</p>}
          <input
            ref={input}
            type="file"
            accept={fileTypes.join(',')}
            hidden
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (file) void change(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            {attachment && (
              <Button variant="outline" size="xl" disabled={busy} onClick={() => void download()}>
                <Download data-icon="inline-start" aria-hidden="true" />
                {downloading ? 'Downloading…' : 'Download'}
              </Button>
            )}
            {query.currentData.data.canManage && (
              <>
                <Button variant="outline" size="xl" disabled={busy} onClick={() => input.current?.click()}>
                  <Paperclip data-icon="inline-start" aria-hidden="true" />
                  {updating ? 'Saving…' : attachment ? 'Replace file' : 'Attach file'}
                </Button>
                {attachment && (
                  <Button variant="ghost" size="xl" disabled={busy} onClick={() => void change(null)}>
                    <Trash2 data-icon="inline-start" aria-hidden="true" />
                    Remove
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
