import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
      setUser({ token, email });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (!response.result || !response.result.token || !response.result.username) {
        throw new Error(response.message || 'Login failed. Please try again.');
      }
      const userData = { token: response.result.token, email: response.result.username };
      localStorage.setItem('token', response.result.token);
      localStorage.setItem('email', response.result.username);
      setUser(userData);
      console.log('Usuario autenticado en AuthContext:', userData);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await authService.register(email, password);
      if (!response.result || !response.result.token || !response.result.username) {
        throw new Error(response.message || 'Registration failed. Please try again.');
      }
      const userData = { token: response.result.token, email: response.result.username };
      localStorage.setItem('token', response.result.token);
      localStorage.setItem('email', response.result.username);
      setUser(userData);
      console.log('Usuario autenticado en AuthContext:', userData);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 