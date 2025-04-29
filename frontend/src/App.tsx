import React from 'react';
import { SolProvider, AuthProvider, useAuth } from '@/hooks';
import "./index.css"
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import router from './router';
import { RouterProvider } from './router';

// Inner component to access auth context
function InnerApp() {
  const auth = useAuth(); // Get auth state from hook

  // Use our updated RouterProvider that properly handles auth context
  return <RouterProvider auth={auth} />;
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SolProvider baseUrl="http://localhost:5150">
        <AuthProvider>
          {/* Render InnerApp which contains the RouterProvider */}
          <InnerApp />
          <Toaster />
        </AuthProvider>
      </SolProvider>
    </ThemeProvider>
  );
};
