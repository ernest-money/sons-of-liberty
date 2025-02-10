import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginParams, RegisterParams } from '../sol/auth';
import { useSol } from './useSol';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string, name: string } | null;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string, name: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sol = useSol();

  const checkAuth = async () => {
    console.log("checkAuth");
    setIsLoading(true);
    try {
      const currentUser = await sol.current();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      console.error('Error checking authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (params: LoginParams) => {
    try {
      await sol.login(params);
      await checkAuth();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const register = async (params: RegisterParams) => {
    await sol.register(params);
  };

  const logout = async () => {
    try {
      console.log("logging out");
      // Call backend logout endpoint to clear the cookie
      await sol.logout();

      // Clear frontend state
      setUser(null);
      setIsAuthenticated(false);

      // Force refresh of auth state
      await checkAuth();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
