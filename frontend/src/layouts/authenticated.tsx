import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks';
import { LoadingSpinner } from '@/components/ui/loading';
import { ProtectedLayout } from '@/layouts/layout';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If the auth context says we're not authenticated, redirect to login
        if (!isAuthenticated) {
          // Simply redirect to login page without any parameters
          navigate({ to: redirectTo });
          return;
        }

        // Set loading to false when we've confirmed authentication
        setLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate({ to: redirectTo });
      }
    };

    // Only check auth when the auth context loading is complete
    if (!authLoading) {
      checkAuth();
    }
  }, [navigate, isAuthenticated, redirectTo, authLoading]);

  // Show loading state while checking authentication
  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  // Render children if authenticated
  return isAuthenticated ? <ProtectedLayout>{children}</ProtectedLayout> : <Navigate to={redirectTo} />;
}; 