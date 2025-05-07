import React from 'react';
import { SolProvider, AuthProvider, useAuth } from '@/hooks';
import "./index.css"
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { RouterProvider } from './router';

// Inner component to access auth context
function InnerApp() {
  const auth = useAuth(); // Get auth state from hook

  return <RouterProvider auth={auth} />;
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SolProvider>
        <AuthProvider>
          <InnerApp />
          <Toaster />
        </AuthProvider>
      </SolProvider>
    </ThemeProvider>
  );
};
