import { ContentSkeleton } from '@/components/shell/ContentSkeleton';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/form-select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
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
import { clearSelectedGroup, setSelectedGroup } from '../groupSlice';
import type { Group } from '../types';
import {
  useGetGroupSettingsQuery,
  useUpdateGroupSettingsMutation,
  useSoftDeleteGroupMutation,
  type GroupDetails,
} from '../settingsApi';
import currencies from '../currencies.json';
import GroupActivity from '../components/GroupActivity';
const icons = [
  'people',
  'home',
  'heart',
  'airplane',
  'car',
  'restaurant',
  'cafe',
  'briefcase',
  'school',
  'game-controller',
  'football',
  'paw',
];
export default function GroupSettingsPage() {
  const group = useAppSelector((state) => state.groups.selectedGroup);
  return group ? (
    <Settings key={group.id} group={group} />
  ) : (
    <Navigate to="/groups" replace />
  );
}
function Settings({ group }: { group: Group }) {
  const query = useGetGroupSettingsQuery(group.id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeader
        eyebrow={group.name}
        title="Group settings"
        description="Manage your shared space and review recent activity."
      />
      {query.isLoading ? (
        <ContentSkeleton label="Loading settings…" layout="form" />
      ) : query.isError ? (
        <div role="alert">
          <p>Could not load group settings.</p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        query.currentData && (
          <SettingsForm
            key={group.id}
            group={group}
            details={query.currentData.data.group}
            fetching={query.isFetching}
          />
        )
      )}
      <GroupActivity id={group.id} />
    </div>
  );
}
function SettingsForm({
  group,
  details,
  fetching,
}: {
  group: Group;
  details: GroupDetails;
  fetching: boolean;
}) {
  const user = useAppSelector((state) => state.auth.user);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState(details.name);
  const [currency, setCurrency] = useState(details.currency);
  const [icon, setIcon] = useState(details.icon || 'people');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [update, saving] = useUpdateGroupSettingsMutation();
  const [remove, deleting] = useSoftDeleteGroupMutation();
  const owner =
    details.role === 'OWNER' &&
    details.ownerId === (user?._id || (user as { id?: string } | null)?.id);
  const busy = saving.isLoading || deleting.isLoading;
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!owner || busy || fetching || !name.trim()) return;
    setError('');
    setMessage('');
    try {
      const response = await update({
        id: group.id,
        name: name.trim(),
        currency: details.canChangeCurrency ? currency : details.currency,
        icon,
      }).unwrap();
      if (!active.current) return;
      dispatch(
        setSelectedGroup({
          ...group,
          name: response.data.group.name,
          currency: response.data.group.currency,
        }),
      );
      setName(response.data.group.name);
      setMessage('Group settings saved.');
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not save settings. Please try again.'),
      );
    }
  }
  async function deleteGroup() {
    if (!owner || busy || confirmation !== details.name) return;
    setError('');
    try {
      await remove(group.id).unwrap();
      if (!active.current) return;
      dispatch(clearSelectedGroup());
      navigate('/groups', { replace: true });
    } catch (caught) {
      setError(
        apiMessage(
          caught,
          'Could not delete the group. Refresh and try again.',
        ),
      );
    }
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Group details</CardTitle>
          <CardDescription>
            {owner
              ? 'Choose a name and settings for the people sharing costs.'
              : 'Only the group owner can change these settings.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={save}
            className="flex flex-col gap-5"
            aria-busy={busy}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="group-name">Group name</FieldLabel>
                <Input
                  id="group-name"
                  required
                  value={name}
                  disabled={!owner || busy}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="group-currency">Currency</FieldLabel>
                <FormSelect
                  id="group-currency"
                  value={currency}
                  onValueChange={setCurrency}
                  disabled={!owner || busy || !details.canChangeCurrency}
                  options={currencies.map((value) => ({ value, label: value }))}
                />
                <FieldDescription>
                  Currency can only change before expenses, bills or payments
                  are recorded.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="group-icon">Group icon</FieldLabel>
                <FormSelect
                  id="group-icon"
                  value={icon}
                  onValueChange={setIcon}
                  disabled={!owner || busy}
                  options={icons.map((value) => ({
                    value,
                    label: value.replaceAll('-', ' '),
                  }))}
                />
              </Field>
            </FieldGroup>
            {message && <p role="status">{message}</p>}
            {error && !confirm && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            {owner && (
              <div>
                <Button
                  type="submit"
                  disabled={busy || fetching || !name.trim()}
                >
                  {saving.isLoading ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      {owner && (
        <Card>
          <CardHeader>
            <CardTitle>Delete group</CardTitle>
            <CardDescription>
              The group will be hidden for all members. Records are preserved,
              and you can restore it from Deleted groups. Recurring expenses are
              paused; missed bill periods are skipped on restoration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              disabled={busy || fetching}
              onClick={() => {
                setError('');
                setConfirmation('');
                setConfirm(true);
              }}
            >
              Delete group
            </Button>
          </CardContent>
        </Card>
      )}
      <Dialog
        open={confirm}
        onOpenChange={(value) => {
          if (!busy) setConfirm(value);
        }}
      >
        <DialogContent showCloseButton={!busy}>
          <DialogHeader>
            <DialogTitle>Delete {details.name}?</DialogTitle>
            <DialogDescription>
              All members will lose access until you restore this group. Its
              records will be kept.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="delete-group-name">
              Type {details.name} to confirm
            </FieldLabel>
            <Input
              id="delete-group-name"
              value={confirmation}
              disabled={busy}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </Field>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy || confirmation !== details.name}
              onClick={deleteGroup}
            >
              {deleting.isLoading ? 'Deleting…' : 'Delete group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
