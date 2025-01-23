import React, { createContext, useContext, useEffect, useState } from 'react';
import { LoginParams, RegisterParams } from '../sol/auth';
import { useSol } from './useSol';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: { id: string; email: string } | null;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const sol = useSol();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          sol.setToken(storedToken);
          const currentUser = await sol.current();
          setUser(currentUser);
          setToken(storedToken); // Ensure token state matches localStorage
        } catch (error) {
          // Only clear token if it's an auth error
          if (error instanceof Error && error.message === 'Unauthorized') {
            logout();
          }
          // For other errors, keep the token
          console.error('Error initializing auth:', error);
        }
      }
    };

    initAuth();
  }, []);

  const login = async (params: LoginParams) => {
    const response = await sol.login(params);
    console.log(response);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    sol.setToken(response.token);
  };

  const register = async (params: RegisterParams) => {
    await sol.register(params);
  };

  const logout = () => {
    console.log("logout");
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    sol.setToken(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
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
