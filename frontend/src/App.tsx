import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SolProvider, AuthProvider, useAuth } from '@/hooks';
import { Dashboard } from '@/app/dashboard/page';
import { CreateContract } from '@/app/create/page';
import "./index.css"
import { Layout } from './layout';
import { ThemeProvider } from './components/theme-provider';
import AuthPage from '@/app/auth/page';
import { ActiveContracts } from '@/app/contracts/active';
import { ClosedContracts } from '@/app/contracts/closed';
import { OfferList } from '@/components/offer-list';
import { Transactions } from '@/app/wallet/transactions';
import { Utxos } from '@/app/wallet/utxos';
import { WalletSection } from '@/components/wallet-section';
import { Toaster } from '@/components/ui/toaster';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        {/** TODO this should be a config*/}
        <SolProvider baseUrl="http://localhost:5150">
          <AuthProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                }
              />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/create" element={<PrivateRoute><CreateContract /></PrivateRoute>} />
              <Route path="/contracts" element={<PrivateRoute><ActiveContracts /></PrivateRoute>} />
              <Route path="/contracts/active" element={<PrivateRoute><ActiveContracts /></PrivateRoute>} />
              <Route path="/contracts/closed" element={<PrivateRoute><ClosedContracts /></PrivateRoute>} />
              <Route path="/offers" element={<PrivateRoute><OfferList /></PrivateRoute>} />
              <Route path="/wallet/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
              <Route path="/wallet/utxos" element={<PrivateRoute><Utxos /></PrivateRoute>} />
              <Route path="/wallet" element={<PrivateRoute><WalletSection /></PrivateRoute>} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </SolProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
