import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  telnyxApiKey?: string;
  sipUsername?: string;
  sipPassword?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setTelnyxApiKey: (key: string) => void;
  setSipCredentials: (username: string, password: string) => void;
  isTelnyxConnected: () => boolean;
  persistCredentials: (apiKey?: string, sipUsername?: string, sipPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - in production, call backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        createdAt: new Date(),
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - in production, call backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        createdAt: new Date(),
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const setTelnyxApiKey = (key: string) => {
    if (user) {
      const updatedUser = { ...user, telnyxApiKey: key };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const setSipCredentials = (username: string, password: string) => {
    if (user) {
      const updatedUser = { ...user, sipUsername: username, sipPassword: password };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const persistCredentials = async (apiKey?: string, sipUsername?: string, sipPassword?: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/telnyx/set-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, sipUsername, sipPassword, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to save credentials');
      }

      // Update local state with new credentials
      const updatedUser: AuthUser = { ...user };
      if (apiKey) updatedUser.telnyxApiKey = apiKey;
      if (sipUsername) updatedUser.sipUsername = sipUsername;
      if (sipPassword) updatedUser.sipPassword = sipPassword;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error persisting credentials:', error);
      throw error;
    }
  };

  const isTelnyxConnected = () => {
    return !!user?.telnyxApiKey;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, setTelnyxApiKey, setSipCredentials, persistCredentials, isTelnyxConnected }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
