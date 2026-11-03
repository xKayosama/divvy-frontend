import { Spinner } from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiMessage } from '@/services/api-error';
import {
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} from '../authApi';
import { logout } from '../authSlice';
import { emailError, normalizedEmail, resetErrors } from '../lib/account-form';
import AccountCard from '../components/AccountCard';
import PasswordField from '../components/PasswordField';
export default function PasswordResetPage({
  initialStep = 'email',
}: {
  initialStep?: 'email' | 'reset';
}) {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>(initialStep);
  const [values, setValues] = useState({
    email: '',
    code: '',
    password: '',
    confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [requestCode, requestState] = useRequestPasswordResetMutation();
  const [resetPassword, resetState] = useResetPasswordMutation();
  const dispatch = useAppDispatch();
  const busy = requestState.isLoading || resetState.isLoading;
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  useEffect(() => {
    if (!resendAt) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= resendAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendAt]);
  function change(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setError('');
  }
  async function sendCode() {
    if (busy || remaining > 0) return;
    const email = normalizedEmail(values.email);
    const invalid = emailError(email);
    setErrors({ email: invalid });
    setError('');
    if (invalid) return;
    try {
      const response = await requestCode({ email }).unwrap();
      setValues((current) => ({ ...current, email, code: '' }));
      setNotice(response.message);
      setStep('reset');
      const time = Date.now();
      setNow(time);
      setResendAt(time + 60000);
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not request a reset code. Please try again.'),
      );
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (step === 'email') {
      await sendCode();
      return;
    }
    const next = resetErrors(values);
    setErrors(next);
    setError('');
    if (Object.values(next).some(Boolean)) return;
    try {
      await resetPassword({
        email: normalizedEmail(values.email),
        code: values.code.trim(),
        password: values.password,
      }).unwrap();
      dispatch(logout());
      setValues((current) => ({
        ...current,
        code: '',
        password: '',
        confirmation: '',
      }));
      setNotice(
        'Your password has been reset. Sign in with your new password. Existing sessions for this account have been signed out.',
      );
      setStep('success');
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not reset your password. Please try again.'),
      );
    }
  }
  function enterCode() {
    const email = normalizedEmail(values.email),
      invalid = emailError(email);
    setErrors({ email: invalid });
    if (!invalid) {
      setValues((current) => ({ ...current, email }));
      setError('');
      setStep('reset');
    }
  }
  return (
    <AccountCard
      title={
        step === 'success'
          ? 'Password reset'
          : step === 'email'
            ? 'Forgot password?'
            : 'Choose a new password'
      }
      description={
        step === 'email'
          ? 'Enter your account email to request a reset code.'
          : step === 'reset'
            ? 'Enter the 8-digit code from your email. Codes expire after 15 minutes.'
            : 'You can now return to your groups.'
      }
      footer={
        <Link
          to="/login"
          className={buttonVariants({
            variant: step === 'success' ? 'default' : 'link',
          })}
          aria-disabled={busy || undefined}
          tabIndex={busy ? -1 : undefined}
          onClick={(e) => {
            if (busy) e.preventDefault();
          }}
        >
          {step === 'success' ? 'Sign in' : 'Back to sign in'}
        </Link>
      }
    >
      {step === 'success' ? (
        <p role="status">{notice}</p>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          aria-busy={busy}
          className="flex flex-col gap-5"
        >
          {notice && (
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          )}
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="reset-email">Email address</FieldLabel>
              <Input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={values.email}
                readOnly={step === 'reset' && !!notice}
                onChange={(e) => change('email', e.target.value)}
                disabled={busy}
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? 'reset-email-error' : undefined
                }
              />
              {errors.email && (
                <FieldError id="reset-email-error">{errors.email}</FieldError>
              )}
            </Field>
            {step === 'reset' && (
              <>
                <Field data-invalid={!!errors.code}>
                  <FieldLabel htmlFor="reset-code">Reset code</FieldLabel>
                  <Input
                    id="reset-code"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    required
                    value={values.code}
                    onChange={(e) => change('code', e.target.value)}
                    disabled={busy}
                    aria-invalid={!!errors.code}
                    aria-describedby={
                      errors.code ? 'reset-code-error' : 'reset-code-hint'
                    }
                  />
                  {errors.code && (
                    <FieldError id="reset-code-error">{errors.code}</FieldError>
                  )}
                  <FieldDescription id="reset-code-hint">
                    Use your latest code. If it is invalid or expired, request a
                    new one.
                  </FieldDescription>
                </Field>
                <PasswordField
                  id="reset-password"
                  label="New password"
                  value={values.password}
                  onChange={(value) => change('password', value)}
                  error={errors.password}
                  disabled={busy}
                  hint
                />
                <PasswordField
                  id="reset-confirmation"
                  label="Confirm new password"
                  value={values.confirmation}
                  onChange={(value) => change('confirmation', value)}
                  error={errors.confirmation}
                  disabled={busy}
                />
              </>
            )}
          </FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={busy} aria-busy={busy}>
            {busy && <Spinner data-icon="inline-start" aria-hidden="true" />}
            {busy
              ? step === 'email'
                ? 'Sending code…'
                : 'Resetting password…'
              : step === 'email'
                ? 'Send reset code'
                : 'Reset password'}
          </Button>
          {step === 'email' ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={enterCode}
            >
              I already have a code
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy || remaining > 0}
                onClick={sendCode}
              >
                {remaining > 0
                  ? `Send a new code in ${remaining}s`
                  : 'Send a new code'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setStep('email');
                  setResendAt(0);
                  setValues((current) => ({
                    ...current,
                    code: '',
                    password: '',
                    confirmation: '',
                  }));
                  setErrors({});
                  setError('');
                  setNotice('');
                }}
              >
                Use a different email
              </Button>
            </>
          )}
        </form>
      )}
    </AccountCard>
  );
}
