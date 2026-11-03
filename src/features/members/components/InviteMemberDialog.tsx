import { Spinner } from '@/components/ui/spinner';
import { useState, type FormEvent } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { apiMessage } from '@/services/api-error';
import { useCreateInvitationMutation } from '../memberApi';
import type { CreatedInvitationResponse } from '../types';

export default function InviteMemberDialog({
  groupId,
  groupName,
  onClose,
}: {
  groupId: string;
  groupName: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [created, setCreated] = useState<
    CreatedInvitationResponse['data'] | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [create, { isLoading }] = useCreateInvitationMutation();
  const invalid =
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isLoading || created) return;
    setAttempted(true);
    setError('');
    if (invalid) return;
    try {
      const result = await create({
        groupId,
        email: email.trim().toLowerCase(),
      }).unwrap();
      setCreated(result.data);
    } catch (cause) {
      setError(
        apiMessage(cause, 'Could not create the invitation. Please try again.'),
      );
    }
  }
  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.code);
      setCopied(true);
      setError('');
    } catch {
      setError('Could not copy. Select and copy the code manually.');
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>
            {created ? 'Invitation created' : 'Invite a member'}
          </DialogTitle>
          <DialogDescription>
            {groupName} · The recipient chooses whether to join.
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="flex flex-col gap-4">
            <Alert>
              <AlertTitle>
                Share this code with {created.invitation.email}
              </AlertTitle>
              <AlertDescription>
                The code is shown only once. Copy it before closing. Divvy does
                not send invitation emails. It expires in 7 days.
              </AlertDescription>
            </Alert>
            <Field>
              <FieldLabel htmlFor="new-invitation-code">
                Invitation code
              </FieldLabel>
              <Input
                id="new-invitation-code"
                readOnly
                value={created.code}
                onFocus={(event) => event.target.select()}
              />
              <FieldDescription>
                The recipient must sign in using the invited email address.
              </FieldDescription>
            </Field>
            <Button variant="outline" onClick={copy}>
              <Copy data-icon="inline-start" />
              {copied ? 'Copied' : 'Copy code'}
            </Button>
            {copied && (
              <p role="status" className="text-sm text-primary">
                Invitation code copied.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <FieldGroup>
              <Field
                data-invalid={attempted && invalid}
                data-disabled={isLoading}
              >
                <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  disabled={isLoading}
                  aria-invalid={attempted && invalid}
                  aria-describedby={
                    attempted && invalid
                      ? 'invite-email-error'
                      : 'invite-email-help'
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                />
                <FieldDescription id="invite-email-help">
                  They can create an account with this email before accepting.
                </FieldDescription>
                {attempted && invalid && (
                  <FieldError id="invite-email-error">
                    Enter a valid email address.
                  </FieldError>
                )}
              </Field>
            </FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Spinner data-icon="inline-start" aria-hidden="true" />
                )}
                {isLoading ? 'Creating…' : 'Create invitation'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
