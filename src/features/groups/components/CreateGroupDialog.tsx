import { toast } from '@/components/ui/toast-manager';
import { Spinner } from '@/components/ui/spinner';
import { FormSelect } from '@/components/ui/form-select';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCreateGroupMutation } from '../groupApi';
import { groupIconOptions } from '../lib/group-icons';
import currencies from '../currencies.json';

export default function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('PHP');
  const [icon, setIcon] = useState('people');
  const [message, setMessage] = useState('');
  const [create, { isLoading }] = useCreateGroupMutation();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (isLoading || !name.trim()) return;
    setMessage('');
    try {
      await create({ name: name.trim(), currency, icon }).unwrap();
      toast.add({ title: 'Group created.', type: 'success' });
      setOpen(false);
      setName('');
      setCurrency('PHP');
      setIcon('people');
    } catch (error) {
      const detail = error as { data?: { message?: string } };
      setMessage(
        detail.data?.message ||
          'Could not create your group. Please try again.',
      );
    }
  }
  return (
    <>
      <Button
        size="xl"
        onClick={() => {
          setMessage('');
          setOpen(true);
        }}
      >
        <Plus className="size-4" />
        Create group
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!isLoading) setOpen(value);
        }}
      >
        <DialogContent
          className="rounded-2xl p-6 sm:max-w-md"
          showCloseButton={!isLoading}
        >
          <DialogHeader>
            <DialogTitle>Create a shared space</DialogTitle>
            <DialogDescription>
              For your home, a trip, or the people you split expenses with.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-5" aria-busy={isLoading}>
            <div className="space-y-2">
              <Label htmlFor="group-name">Group name</Label>
              <Input
                id="group-name"
                placeholder="e.g. Our apartment"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-currency">Currency</Label>
              <FormSelect
                id="group-currency"
                value={currency}
                onValueChange={setCurrency}
                disabled={isLoading}
                options={currencies.map((value) => ({ value, label: value }))}
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Choose carefully. Currency can only change before the group has
                financial activity.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-group-icon">Group icon</Label>
              <FormSelect
                id="create-group-icon"
                value={icon}
                onValueChange={setIcon}
                disabled={isLoading}
                options={groupIconOptions}
              />
            </div>
            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                size="xl"
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button size="xl" type="submit" disabled={isLoading || !name.trim()}>
                {isLoading && (
                  <Spinner data-icon="inline-start" aria-hidden="true" />
                )}
                {isLoading ? 'Creating…' : 'Create group'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
