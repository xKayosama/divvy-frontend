import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { useLogoutSessionMutation } from '../authApi';
import { logout } from '../authSlice';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const dispatch = useAppDispatch();
  const [endSession, { isLoading }] = useLogoutSessionMutation();
  const [failed, setFailed] = useState(false);
  async function signOut() {
    setFailed(false);
    try {
      await endSession().unwrap();
      dispatch(logout());
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 401
      )
        dispatch(logout());
      else setFailed(true);
    }
  }
  return (
    <div>
      <Button variant="ghost" disabled={isLoading} onClick={signOut}>
        <LogOut className="size-4" />
        {isLoading ? 'Signing out…' : 'Sign out'}
      </Button>
      {failed && (
        <p role="alert" className="text-xs text-destructive">
          Sign out failed. Please retry.
        </p>
      )}
    </div>
  );
}
