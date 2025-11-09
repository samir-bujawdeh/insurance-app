import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminUser } from "@/types";
import { adminLogin, getAdminProfile, logout as apiLogout } from "@/api/auth";

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("admin_token");
    if (token) {
      loadUser();
    } else {
      // No mock user - require real login
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const profile = await getAdminProfile();
      setUser(profile);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem("admin_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await adminLogin({ email, password });
    localStorage.setItem("admin_token", response.access_token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem("admin_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
