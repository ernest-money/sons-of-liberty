import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSol } from './useSol';
import { LoginParams, RegisterParams } from '@/lib/sol/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string, name: string, nostr_profile: string | null } | null;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Storage key for persisting auth state
const AUTH_STORAGE_KEY = 'ernest_auth_state';

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Try to get initial state from local storage to prevent flicker on navigation
  const getInitialState = () => {
    try {
      const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedState) {
        const { user, isAuthenticated } = JSON.parse(storedState);
        return { user, isAuthenticated };
      }
    } catch (e) {
      console.warn('Failed to parse stored auth state');
    }
    return { user: null, isAuthenticated: false };
  };

  const initialState = getInitialState();
  const [user, setUser] = useState<{ id: string; email: string, name: string, nostr_profile: string | null } | null>(initialState.user);
  // Initialize with stored state if available
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const sol = useSol();

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, isAuthenticated }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user, isAuthenticated]);

  // Renamed to verifyAuth for clarity - runs once on mount
  const verifyAuth = async () => {
    try {
      const currentUser = await sol.current();
      setUser(currentUser);
      setIsAuthenticated(true); // Set authenticated based on API success
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false); // Ensure state reflects failed verification
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false); // Verification attempt finished
    }
  };

  useEffect(() => {
    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const login = async (params: LoginParams) => {
    setIsLoading(true);
    try {
      await sol.login(params);
      // Immediately fetch user data after successful login API call
      const currentUser = await sol.current();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error logging in or fetching user data:', error);
      // Ensure state is reset on any login/fetch failure
      setUser(null);
      setIsAuthenticated(false);
      throw error; // Re-throw the error to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: RegisterParams) => {
    // Assuming registration doesn't automatically log the user in
    // We might want to add isLoading state here too for better UX
    setIsLoading(true);
    try {
      await sol.register(params);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
    // No auth state change needed here post-registration typically
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await sol.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear frontend state and storage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading, // This isLoading state is now crucial
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
