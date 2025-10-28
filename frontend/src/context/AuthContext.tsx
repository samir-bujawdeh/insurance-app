import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { getCurrentUser } from "../api/auth";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🧠 Try to load stored token and fetch user info on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.log("No stored token or error verifying user");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = (userData: User) => setUser(userData);

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);