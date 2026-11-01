import type { ReactNode } from 'react';
import AuthLayout from './AuthLayout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
export default function AccountCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <AuthLayout>
      <Card className="mx-auto w-full max-w-sm gap-6 bg-transparent py-0 shadow-none ring-0">
        <CardHeader className="px-0">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Sharing made simple
          </p>
          <CardTitle>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">{children}</CardContent>
        <CardFooter className="flex-wrap justify-center gap-3 bg-transparent px-0">
          {footer}
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
