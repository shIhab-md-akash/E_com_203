import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('apex_access_token');
      const savedUser = localStorage.getItem('apex_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify with profile endpoint in background
          const res = await api.get('/api/auth/profile/');
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('apex_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Initial session check failed, using cached user if available');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    const response = await api.post('/api/auth/login/', { username, password });
    const { access, refresh, user: loggedUser } = response.data;

    localStorage.setItem('apex_access_token', access);
    localStorage.setItem('apex_refresh_token', refresh);
    localStorage.setItem('apex_user', JSON.stringify(loggedUser));

    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data: any): Promise<void> => {
    await api.post('/api/auth/register/', data);
  };

  const logout = () => {
    localStorage.removeItem('apex_access_token');
    localStorage.removeItem('apex_refresh_token');
    localStorage.removeItem('apex_user');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/api/auth/profile/', data);
    const updatedUser = response.data.data;
    setUser(updatedUser);
    localStorage.setItem('apex_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const isAdmin = Boolean(user && user.role === 'ADMIN');
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
