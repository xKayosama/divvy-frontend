import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SignupVerification from '../components/SignupVerification';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiMessage } from '@/services/api-error';
import { useRegisterMutation } from '../authApi';
import { normalizedEmail, registrationErrors } from '../lib/account-form';
import AccountCard from '../components/AccountCard';
import PasswordField from '../components/PasswordField';
export default function RegisterPage() {
  const location = useLocation();
  const [verificationEmail, setVerificationEmail] = useState<string>(location.state?.verificationEmail || '');
  const [notice, setNotice] = useState('');
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [register, state] = useRegisterMutation();
  function change(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setError('');
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state.isLoading) return;
    const next = registrationErrors(values);
    setErrors(next);
    setError('');
    if (Object.values(next).some(Boolean)) return;
    try {
      const result = await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: normalizedEmail(values.email),
        password: values.password,
      }).unwrap();
      setValues((current) => ({ ...current, password: '', confirmation: '' }));
      setVerificationEmail(normalizedEmail(values.email));
      setNotice(result.message);
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not create your account. Please try again.'),
      );
    }
  }
  return (
    <AccountCard
      title={complete ? 'Your account is ready' : verificationEmail ? 'Verify your email' : 'Create an account'}
      description={
        complete
          ? 'Sign in to start sharing expenses with your groups.'
          : 'For friends, trips and everyone sharing costs.'
      }
      footer={
        <Link
          to="/login"
          className={buttonVariants({ variant: complete ? 'default' : 'link' })}
        >
          {complete ? 'Sign in' : 'Already have an account? Sign in'}
        </Link>
      }
    >
      {complete ? (
        <p role="status">Account created successfully. You can now sign in.</p>
      ) : verificationEmail ? (
        <div className="flex flex-col gap-5">
          {notice && <p role="status">{notice}</p>}
          <SignupVerification email={verificationEmail} onVerified={() => setComplete(true)} />
        </div>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          aria-busy={state.isLoading}
          className="flex flex-col gap-5"
        >
          <FieldGroup>
            {(['firstName', 'lastName', 'email'] as const).map((key) => (
              <Field key={key} data-invalid={!!errors[key]}>
                <FieldLabel htmlFor={`register-${key}`}>
                  {key === 'firstName'
                    ? 'First name'
                    : key === 'lastName'
                      ? 'Last name'
                      : 'Email address'}
                </FieldLabel>
                <Input
                  id={`register-${key}`}
                  name={key}
                  type={key === 'email' ? 'email' : 'text'}
                  autoComplete={
                    key === 'firstName'
                      ? 'given-name'
                      : key === 'lastName'
                        ? 'family-name'
                        : 'email'
                  }
                  value={values[key]}
                  onChange={(e) => change(key, e.target.value)}
                  maxLength={key === 'email' ? 254 : 100}
                  disabled={state.isLoading}
                  required
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? `${key}-error` : undefined}
                />
                {errors[key] && (
                  <FieldError id={`${key}-error`}>{errors[key]}</FieldError>
                )}
              </Field>
            ))}
            <PasswordField
              id="register-password"
              label="Password"
              value={values.password}
              onChange={(value) => change('password', value)}
              error={errors.password}
              disabled={state.isLoading}
              hint
            />
            <PasswordField
              id="register-confirmation"
              label="Confirm password"
              value={values.confirmation}
              onChange={(value) => change('confirmation', value)}
              error={errors.confirmation}
              disabled={state.isLoading}
            />
          </FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={state.isLoading}>
            {state.isLoading && (
              <Spinner data-icon="inline-start" aria-hidden="true" />
            )}
            {state.isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      )}
    </AccountCard>
  );
}
