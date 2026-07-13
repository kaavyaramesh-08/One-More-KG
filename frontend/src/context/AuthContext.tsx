import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  bmi: number;
  bmiCategory: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
  apiUrl: string;
  getHeaders: () => HeadersInit;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Read backend URL from Vite environment, default to localhost:8080
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

  useEffect(() => {
    const storedToken = localStorage.getItem('onemorekg_token');
    const storedUser = localStorage.getItem('onemorekg_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUserState(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUserState(newUser);
    localStorage.setItem('onemorekg_token', newToken);
    localStorage.setItem('onemorekg_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    localStorage.removeItem('onemorekg_token');
    localStorage.removeItem('onemorekg_user');
  };

  const updateUser = (newUser: UserProfile) => {
    setUserState(newUser);
    localStorage.setItem('onemorekg_user', JSON.stringify(newUser));
  };

  const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brandbg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
        apiUrl,
        getHeaders,
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
