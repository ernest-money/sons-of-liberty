import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks';
import { ProtectedLayout } from '@/layouts/layout';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { user } = useAuth();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // If user exists but doesn't have a Nostr profile, redirect to finish profile
  if (!user.nostr_profile) {
    return <Navigate to="/account/finish" />;
  }

  // User is authenticated and has completed profile
  return <ProtectedLayout>{children}</ProtectedLayout>;
}; 