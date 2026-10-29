import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetMeQuery } from '@/features/auth/authApi';
import { logout, setUser } from '@/features/auth/authSlice';

const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const { data, error, isFetching, isLoading, refetch } = useGetMeQuery(
    undefined,
    {
      skip: !isAuthenticated || !!user,
    },
  );

  useEffect(() => {
    if (data?.data.user) {
      dispatch(setUser(data.data.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      dispatch(logout());
    }
  }, [dispatch, error]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user && (isLoading || isFetching)) {
    return null;
  }

  if (!user && error) {
    return (
      <main className="grid min-h-svh place-content-center gap-4 p-6 text-center">
        <p>Unable to verify your session. Please try again.</p>
        <Button variant="link" onClick={() => refetch()}>
          Try again
        </Button>
      </main>
    );
  }
  return <Outlet />;
};

export default ProtectedRoute;
