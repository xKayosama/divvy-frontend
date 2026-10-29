import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSignOut } from '../hooks/useSignOut';

export default function LogoutButton() {
  const { signOut, isLoading, error } = useSignOut();
  return (
    <div>
      <Button
        variant="ghost"
        disabled={isLoading}
        onClick={() => void signOut()}
      >
        <LogOut data-icon="inline-start" />
        {isLoading ? 'Signing out…' : 'Sign out'}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
