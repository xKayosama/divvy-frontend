import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '../components/AuthLayout';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button-variants';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLoginMutation } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setErrorMessage('');

    try {
      const response = await login({
        email,
        password,
      }).unwrap();

      dispatch(
        setCredentials({
          token: response.data.token,
          user: response.data.user,
        }),
      );

      navigate('/groups', { replace: true });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const apiError = error as {
          data?: {
            message?: string;
          };
        };

        setErrorMessage(apiError.data?.message || 'Login failed.');
      } else {
        setErrorMessage('Something went wrong.');
      }
    }
  };

  return (
    <AuthLayout>
      <Card className="mx-auto w-full max-w-sm gap-0 overflow-visible bg-transparent py-0 shadow-none ring-0">
        <CardHeader className="gap-0 px-0">
          {/* <span className="mb-6 hidden size-12 items-center justify-center rounded-2xl border border-[#087F65]/10 bg-[#E5F5EE] text-[#087F65] lg:flex"><LockKeyhole className="size-5" aria-hidden="true" /></span> */}
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#08634F] uppercase">
            Your group, on the same page
          </p>
          <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
            <h1 id="login-heading">Welcome back</h1>
          </CardTitle>
          <CardDescription className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in to your Divvy account.
            <br />
            Let’s get your shared expenses sorted.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5 sm:mt-9"
            aria-busy={isLoading}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-4 left-4 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 text-base md:text-base rounded-xl border-border bg-white pl-11 focus-visible:border-[#08634F] focus-visible:ring-[#08634F]/15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute top-4 left-4 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 text-base md:text-base rounded-xl border-border bg-white pr-12 pl-11 focus-visible:border-[#08634F] focus-visible:ring-[#08634F]/15"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute top-1 right-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#08634F]"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-sm font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner data-icon="inline-start" aria-hidden="true" />{' '}
                  Signing in…
                </>
              ) : (
                <>
                  Sign in{' '}
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <Link
            to="/forgot-password"
            className={buttonVariants({ variant: 'link' })}
          >
            Forgot password?
          </Link>
          <Link to="/register" className={buttonVariants({ variant: 'link' })}>
            Create an account
          </Link>
        </div>
        <CardFooter className="mt-6 justify-center sm:mt-9 border-border bg-transparent px-0 pt-6 pb-0 text-center">
          <p className="text-xs leading-5 text-muted-foreground">
            Shared plans. Shared expenses. Less stress.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
