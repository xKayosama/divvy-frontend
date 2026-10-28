import { Brand } from '@/components/brand/Brand';
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
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Receipt,
  Users,
} from 'lucide-react';

const Login = () => {
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
    <main className="min-h-svh bg-background bg-brand-screen p-3 font-sans text-foreground sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-7xl sm:min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm lg:grid-cols-[1.05fr_1fr]">
        <section
          className="relative flex flex-col justify-between overflow-hidden bg-brand-spending p-5 text-white sm:p-8 lg:p-14"
          aria-labelledby="brand-heading"
        >
          <div
            className="pointer-events-none absolute -right-32 top-40 size-96 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-20 top-52 size-72 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div className="relative inline-flex w-fit items-center rounded-2xl bg-[#F3F8F6] px-4 py-2">
            <Brand />
          </div>

          <div className="relative pt-6 sm:pt-8 lg:py-16">
            <p className="mb-5 hidden text-xs font-semibold tracking-[0.2em] text-[#A1E8CD] uppercase lg:block">
              A little less math. A lot more home.
            </p>
            <h2
              id="brand-heading"
              className="max-w-md text-3xl leading-[1.12] font-medium tracking-tight sm:text-4xl lg:text-6xl"
            >
              Shared home.
              <br />
              Simpler <span className="text-[#A1E8CD]">expenses.</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 lg:mt-6 lg:text-base lg:leading-7 text-emerald-50/75">
              Keep the bills organized and everyone on the same page. Make room
              for what matters.
            </p>

            <div className="mt-10 hidden max-w-sm rotate-[-2deg] rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl lg:block">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Receipt
                    className="size-4 text-[#A1E8CD]"
                    aria-hidden="true"
                  />{' '}
                  A happier household
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] tracking-wider uppercase">
                  The Divvy way
                </span>
              </div>
              {[
                'Every shared expense, in one place',
                'A clear picture of who owes what',
                'Less chasing. More living.',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-t border-white/10 py-3 text-sm text-emerald-50/90"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#A1E8CD] text-[#087F65]">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="relative hidden items-center gap-2 text-xs text-emerald-50/60 lg:flex">
            <Users className="size-4" aria-hidden="true" /> Made for the people
            you call home.
          </p>
        </section>

        <section
          className="flex min-w-0 flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 lg:px-16 lg:py-12"
          aria-labelledby="login-heading"
        >
          <Card className="mx-auto w-full max-w-sm gap-0 overflow-visible bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="gap-0 px-0">
              {/* <span className="mb-6 hidden size-12 items-center justify-center rounded-2xl border border-[#087F65]/10 bg-[#E5F5EE] text-[#087F65] lg:flex"><LockKeyhole className="size-5" aria-hidden="true" /></span> */}
              <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#08634F] uppercase">
                Your home, in harmony
              </p>
              <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <h1 id="login-heading">Welcome back</h1>
              </CardTitle>
              <CardDescription className="mt-3 text-sm leading-6 text-muted-foreground">
                Sign in to your Divvy account.
                <br />
                Let’s get your household sorted.
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
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
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
                      <LoaderCircle
                        className="size-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />{' '}
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
            <CardFooter className="mt-6 justify-center sm:mt-9 border-border bg-transparent px-0 pt-6 pb-0 text-center">
              <p className="text-xs leading-5 text-muted-foreground">
                One home. Shared expenses. Less stress.
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Login;
