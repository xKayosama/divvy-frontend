import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { apiMessage } from '@/services/api-error';
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from '../authApi';

export default function SignupVerification({
  email,
  onVerified,
}: {
  email: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verify, verification] = useVerifyEmailMutation();
  const [resend, sending] = useResendVerificationMutation();
  const busy = verification.isLoading || sending.isLoading;
  return (
    <form
      className="flex flex-col gap-5"
      aria-busy={busy}
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setError('');
        try {
          await verify({ email, code }).unwrap();
          onVerified();
        } catch (caught) {
          setError(apiMessage(caught, 'Could not verify your email.'));
        }
      }}
    >
      <p>
        Enter the 8-digit code sent to {email}. It expires in 15 minutes. Check
        your spam folder too.
      </p>
      <Field>
        <FieldLabel htmlFor="signup-code">Verification code</FieldLabel>
        <Input
          id="signup-code"
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{8}"
          maxLength={8}
          required
          value={code}
          onChange={(event) => setCode(event.target.value)}
          disabled={busy}
        />
      </Field>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <Button type="submit" disabled={busy}>
        {verification.isLoading ? 'Verifying…' : 'Verify email'}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setError('');
          setMessage('');
          try {
            const result = await resend({ email }).unwrap();
            setMessage(result.message);
          } catch (caught) {
            setError(apiMessage(caught, 'Could not resend the code.'));
          }
        }}
      >
        Resend code
      </Button>
    </form>
  );
}
