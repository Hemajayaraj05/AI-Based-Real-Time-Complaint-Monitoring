import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "student" | "admin" | "division_head" | "electrician" | "cleanliness_manager" | "faculty" | "hostel_manager" | "librarian" | "cafeteria_manager" | "exam_coordinator" | "security" | "transport_manager";

export type Division =
  | "cleanliness"
  | "water"
  | "electricity"
  | "hostel"
  | "transport"
  | "library"
  | "food"
  | "infrastructure"
  | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: UserRole;
  division?: Division; // For division heads
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, department: string, role: UserRole, division?: Division) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Mock signup - in future replace with API call
  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    department: string, 
    role: UserRole, 
    division?: Division
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, department, role, division }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Signup failed");
      }

      const data = await res.json();
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        // backend does not return token on signup in current implementation
        setUser(data.user);
      }
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock login - in future replace with API call
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error("Email and password required");

      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Login failed");
      }

      const { user: returnedUser, token } = payload;
      if (!returnedUser || !token) {
        throw new Error("Invalid server response");
      }

      localStorage.setItem("user", JSON.stringify(returnedUser));
      localStorage.setItem("authToken", token);
      setUser(returnedUser);
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
