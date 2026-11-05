import { toast } from '@/components/ui/toast-manager';
import { Spinner } from '@/components/ui/spinner';
import { useRef, useState, type FormEvent } from 'react';

import { useAppDispatch } from '@/app/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2, UserCircle } from 'lucide-react';
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
import { useUpdateAvatarMutation, useUpdateProfileMutation } from '../authApi';
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
  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation();
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState('');
  const busy = isLoading || isUpdatingAvatar;
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const firstInvalid = !firstName.trim() || firstName.trim().length > 100;
  const lastInvalid = !lastName.trim() || lastName.trim().length > 100;
  const changed =
    firstName.trim() !== user.firstName || lastName.trim() !== user.lastName;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    setError('');

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
          avatar: profile.avatar === undefined ? user.avatar : profile.avatar,
          role: profile.role ?? user.role,
        }),
      );
      setFirstName(profile.firstName);
      setLastName(profile.lastName);

      toast.add({ title: 'Profile updated.', type: 'success' });
    } catch (cause) {
      setError(
        apiMessage(cause, 'Could not update your profile. Please try again.'),
      );
    }
  }

  async function changePhoto(file: File | null) {
    if (busy) return;
    setPhotoError('');
    if (
      file &&
      (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size === 0 ||
        file.size > 5 * 1024 * 1024)
    ) {
      setPhotoError('Choose a JPEG, PNG, or WebP image up to 5 MB.');
      return;
    }
    const token = getStoredToken();
    try {
      const { data } = await updateAvatar(file).unwrap();
      if (!token || token !== getStoredToken()) return;
      dispatch(setUser({ ...user, avatar: data.user.avatar ?? null }));
      toast.add({
        title: file ? 'Profile photo updated.' : 'Profile photo removed.',
        type: 'success',
      });
    } catch (cause) {
      setPhotoError(
        apiMessage(
          cause,
          'Could not update your profile photo. Please try again.',
        ),
      );
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
        showCloseButton={!busy}
      >
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogDescription>
            Update your photo and the name shown on your Divvy account.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-6"
          aria-busy={busy}
        >
          <FieldGroup>
            <Field className="gap-3 rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-4">
                <Avatar aria-hidden="true" className="size-16">
                  <AvatarImage src={user.avatar ?? undefined} alt="" />
                  <AvatarFallback>
                    <UserCircle className="size-7" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Profile photo</p>
                  <p
                    id="profile-photo-help"
                    className="mt-1 text-xs leading-5 text-muted-foreground"
                  >
                    JPEG, PNG, or WebP up to 5 MB. Photo changes save
                    immediately.
                  </p>
                </div>
              </div>
              <input
                ref={photoInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={busy}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void changePhoto(file);
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  disabled={busy}
                  aria-describedby="profile-photo-help"
                  onClick={() => photoInput.current?.click()}
                >
                  {isUpdatingAvatar ? (
                    <Spinner data-icon="inline-start" aria-hidden="true" />
                  ) : (
                    <Camera data-icon="inline-start" aria-hidden="true" />
                  )}
                  {isUpdatingAvatar
                    ? 'Updating photo…'
                    : user.avatar
                      ? 'Change photo'
                      : 'Add photo'}
                </Button>
                {user.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xl"
                    disabled={busy}
                    onClick={() => void changePhoto(null)}
                  >
                    <Trash2 data-icon="inline-start" aria-hidden="true" />
                    Remove photo
                  </Button>
                )}
              </div>
              {photoError && <FieldError>{photoError}</FieldError>}
            </Field>
            <Field
              data-disabled={busy}
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
                disabled={busy}
                aria-invalid={attempted && firstInvalid}
                aria-describedby={
                  attempted && firstInvalid ? 'profile-first-error' : undefined
                }
                onChange={(event) => {
                  setFirstName(event.target.value);

                  setError('');
                }}
              />
              {attempted && firstInvalid && (
                <FieldError id="profile-first-error">
                  Enter a first name of 1–100 characters.
                </FieldError>
              )}
            </Field>
            <Field data-disabled={busy} data-invalid={attempted && lastInvalid}>
              <FieldLabel htmlFor="profile-last-name">Last name</FieldLabel>
              <Input
                id="profile-last-name"
                name="family-name"
                autoComplete="family-name"
                value={lastName}
                maxLength={100}
                required
                disabled={busy}
                aria-invalid={attempted && lastInvalid}
                aria-describedby={
                  attempted && lastInvalid ? 'profile-last-error' : undefined
                }
                onChange={(event) => {
                  setLastName(event.target.value);

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
          <DialogFooter>
            <Button
              size="xl"
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Close
            </Button>
            <Button size="xl" type="submit" disabled={busy || !changed}>
              {isLoading && (
                <Spinner data-icon="inline-start" aria-hidden="true" />
              )}
              {isLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
