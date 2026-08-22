/**
 * Route guard — redirects to /login if not authenticated.
 * Attempts a silent token refresh on first load.
 */
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // On first mount, try to refresh the token
    // (user may have a valid httpOnly refresh cookie from a previous session)
    if (!isAuthenticated) {
      refresh().finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
