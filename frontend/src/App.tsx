import React from 'react';
import { SolProvider, AuthProvider, useAuth } from '@/hooks';
import "./index.css"
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import router from './router';
import { RouterProvider } from '@tanstack/react-router';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SolProvider baseUrl="http://localhost:5150">
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </SolProvider>
    </ThemeProvider>
  );
};
