import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSol } from './useSol';
import { LoginParams, RegisterParams } from '@/lib/sol/auth';

interface AuthContextType {
  user: { id: string; email: string, name: string, nostr_profile: string | null } | null;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string, name: string, nostr_profile: string | null } | null>(null);
  const sol = useSol();

  useEffect(() => {
    // Initial user fetch
    sol.current()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const login = async (params: LoginParams) => {
    try {
      await sol.login(params);
      const currentUser = await sol.current();
      setUser(currentUser);
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
      await sol.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
