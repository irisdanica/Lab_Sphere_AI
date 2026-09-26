import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  getCurrentUser,
  getAuthToken,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  removeAuthToken,
  setAuthToken,
  updateProfile as apiUpdateProfile,
  User,
} from "@/services/api";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    confirm_password?: string;
    institution?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: {
    name?: string;
    institution?: string;
    bio?: string;
    role?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const storedToken = getAuthToken();
      if (storedToken) {
        setToken(storedToken);
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token expired or invalid
          removeAuthToken();
          setToken(null);
          setUser(null);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    setToken(res.token);
    setUser(res.user);
    setAuthToken(res.token);
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    confirm_password?: string;
    institution?: string;
  }) => {
    const res = await apiRegister(data);
    setToken(res.token);
    setUser(res.user);
    setAuthToken(res.token);
  };

  const logout = async () => {
    await apiLogout();
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: {
    name?: string;
    institution?: string;
    bio?: string;
    role?: string;
  }) => {
    const updated = await apiUpdateProfile(data);
    if (updated) {
      setUser(updated);
    }
  };

  const refreshUser = async () => {
    const current = await getCurrentUser();
    if (current) setUser(current);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
