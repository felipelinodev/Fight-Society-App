'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    currentPassword?: string;
  }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('fight_society_token');
    const savedUser = localStorage.getItem('fight_society_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with API in background
        api
          .getProfile(savedToken)
          .then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('fight_society_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            // If token invalid, clear
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
        return;
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.accessToken);
      localStorage.setItem('fight_society_token', res.accessToken);

      const profile = await api.getProfile(res.accessToken);
      setUser(profile);
      localStorage.setItem('fight_society_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setToken(res.accessToken);
      localStorage.setItem('fight_society_token', res.accessToken);

      const profile = await api.getProfile(res.accessToken);
      setUser(profile);
      localStorage.setItem('fight_society_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fight_society_token');
    localStorage.removeItem('fight_society_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await api.getProfile(token);
      setUser(freshUser);
      localStorage.setItem('fight_society_user', JSON.stringify(freshUser));
    } catch (e) {
      console.error('Error refreshing user profile', e);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    currentPassword?: string;
  }) => {
    if (!token) return;
    const updatedUser = await api.updateProfile(data, token);
    setUser(updatedUser);
    localStorage.setItem('fight_society_user', JSON.stringify(updatedUser));
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return;
    await api.updatePassword(currentPassword, newPassword, token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
