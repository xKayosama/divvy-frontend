import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { useLogoutSessionMutation } from '../authApi';
import { logout } from '../authSlice';

export function useSignOut() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [endSession, { isLoading }] = useLogoutSessionMutation();
  const [error, setError] = useState('');

  async function signOut() {
    if (isLoading) return false;
    setError('');
    try {
      await endSession().unwrap();
    } catch (cause) {
      if (!(
        cause &&
        typeof cause === 'object' &&
        'status' in cause &&
        cause.status === 401
      )) {
        setError('Sign out failed. Please try again.');
        return false;
      }
    }
    dispatch(logout());
    navigate('/login', { replace: true });
    return true;
  }
  return { signOut, isLoading, error };
}
