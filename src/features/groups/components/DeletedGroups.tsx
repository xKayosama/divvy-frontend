import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiMessage } from '@/services/api-error';
import {
  useGetDeletedGroupsQuery,
  useRestoreGroupMutation,
  type DeletedGroup,
} from '../settingsApi';
export default function DeletedGroups() {
  const [expanded, setExpanded] = useState(false);
  const query = useGetDeletedGroupsQuery(undefined, {
    skip: !expanded,
    refetchOnMountOrArgChange: true,
  });
  const [restore, state] = useRestoreGroupMutation();
  const [selected, setSelected] = useState<DeletedGroup | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function submit() {
    if (!selected || state.isLoading) return;
    setError('');
    try {
      await restore(selected.id).unwrap();
      setSelected(null);
      setNotice(
        'Group restored. Open it to review paused recurring expenses before resuming them.',
      );
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not restore the group. Please try again.'),
      );
    }
  }
  return (
    <section className="mt-8 flex flex-col gap-4">
      <div>
        <Button
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="deleted-groups"
        >
          <Trash2 data-icon="inline-start" aria-hidden="true" />
          {expanded ? 'Hide deleted groups' : 'Deleted groups'}
        </Button>
      </div>
      {notice && <p role="status">{notice}</p>}
      {expanded && (
        <Card id="deleted-groups">
          <CardHeader>
            <CardTitle>Deleted groups</CardTitle>
            <CardDescription>
              Groups you own can be restored with their records and memberships.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {query.isFetching ? (
              <p role="status">Loading deleted groups…</p>
            ) : query.isError ? (
              <div role="alert">
                <p>Could not load deleted groups.</p>
                <Button variant="outline" onClick={() => query.refetch()}>
                  Try again
                </Button>
              </div>
            ) : !query.data?.data.groups.length ? (
              <p>No deleted groups.</p>
            ) : (
              query.data.data.groups.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
                >
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.currency} · Deleted{' '}
                      {new Date(group.deletedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setError('');
                      setSelected(group);
                    }}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !state.isLoading) setSelected(null);
        }}
      >
        <DialogContent showCloseButton={!state.isLoading}>
          <DialogHeader>
            <DialogTitle>Restore {selected?.name}?</DialogTitle>
            <DialogDescription>
              Members will regain access. Recurring expenses remain paused until
              you resume them. Missed recurring bill periods will be skipped.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              size="xl"
              variant="outline"
              disabled={state.isLoading}
              onClick={() => setSelected(null)}
            >
              Cancel
            </Button>
            <Button size="xl" disabled={state.isLoading} onClick={submit}>
              {state.isLoading ? 'Restoring…' : 'Restore group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
