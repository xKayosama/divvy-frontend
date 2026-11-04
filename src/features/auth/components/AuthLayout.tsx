import type { ReactNode } from 'react';
import { Brand } from '@/components/brand/Brand';
import { Check, Receipt, Users } from 'lucide-react';
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-background bg-brand-screen p-3 font-sans text-foreground sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-7xl sm:min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[1.05fr_1fr]">
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
              A little less math. A lot more living.
            </p>
            <h2
              id="brand-heading"
              className="max-w-md text-3xl leading-[1.12] font-medium tracking-tight sm:text-4xl lg:text-6xl"
            >
              Shared plans.
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
                  Sharing made simple
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
            <Users className="size-4" aria-hidden="true" /> For friends, trips,
            and everyday shared plans.
          </p>
        </section>

        <section
          className="flex min-w-0 flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 lg:px-16 lg:py-12"
          aria-label="Account access"
        >
          {children}
        </section>
      </div>
    </main>
  );
}
