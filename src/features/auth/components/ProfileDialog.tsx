import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { apiMessage } from '@/services/api-error';
import { getStoredToken } from '@/services/session';
import { useUpdateProfileMutation } from '../authApi';
import { setUser } from '../authSlice';
import type { User } from '../types';

export default function ProfileDialog({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const firstInvalid = !firstName.trim() || firstName.trim().length > 100;
  const lastInvalid = !lastName.trim() || lastName.trim().length > 100;
  const changed =
    firstName.trim() !== user.firstName || lastName.trim() !== user.lastName;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isLoading) return;
    setAttempted(true);
    setError('');
    setSaved(false);
    if (firstInvalid || lastInvalid || !changed) return;
    const token = getStoredToken();
    try {
      const response = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }).unwrap();
      if (!token || token !== getStoredToken()) return;
      const profile = response.data.user;
      dispatch(
        setUser({
          ...user,
          _id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          role: profile.role ?? user.role,
        }),
      );
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setSaved(true);
    } catch (cause) {
      setError(
        apiMessage(cause, 'Could not update your profile. Please try again.'),
      );
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
          <DialogTitle>Your profile</DialogTitle>
          <DialogDescription>
            Update the name shown on your Divvy account.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-6"
          aria-busy={isLoading}
        >
          <FieldGroup>
            <Field
              data-disabled={isLoading}
              data-invalid={attempted && firstInvalid}
            >
              <FieldLabel htmlFor="profile-first-name">First name</FieldLabel>
              <Input
                id="profile-first-name"
                name="given-name"
                autoComplete="given-name"
                value={firstName}
                maxLength={100}
                required
                disabled={isLoading}
                aria-invalid={attempted && firstInvalid}
                aria-describedby={
                  attempted && firstInvalid ? 'profile-first-error' : undefined
                }
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setSaved(false);
                  setError('');
                }}
              />
              {attempted && firstInvalid && (
                <FieldError id="profile-first-error">
                  Enter a first name of 1–100 characters.
                </FieldError>
              )}
            </Field>
            <Field
              data-disabled={isLoading}
              data-invalid={attempted && lastInvalid}
            >
              <FieldLabel htmlFor="profile-last-name">Last name</FieldLabel>
              <Input
                id="profile-last-name"
                name="family-name"
                autoComplete="family-name"
                value={lastName}
                maxLength={100}
                required
                disabled={isLoading}
                aria-invalid={attempted && lastInvalid}
                aria-describedby={
                  attempted && lastInvalid ? 'profile-last-error' : undefined
                }
                onChange={(event) => {
                  setLastName(event.target.value);
                  setSaved(false);
                  setError('');
                }}
              />
              {attempted && lastInvalid && (
                <FieldError id="profile-last-error">
                  Enter a last name of 1–100 characters.
                </FieldError>
              )}
            </Field>
            <div>
              <p className="text-xs text-muted-foreground">Email address</p>
              <p className="mt-1 break-words text-sm">{user.email}</p>
            </div>
          </FieldGroup>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-primary">
              Profile updated.
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
            >
              Close
            </Button>
            <Button type="submit" disabled={isLoading || !changed}>
              {isLoading && (
                <LoaderCircle
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              {isLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
