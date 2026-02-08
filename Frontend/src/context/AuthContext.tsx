import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, department: string, role: UserRole) => Promise<void>;
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
  const signup = async (name: string, email: string, password: string, department: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock user creation
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        department,
        role,
      };

      // Store user in localStorage (mock backend)
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("authToken", "mock-token-" + Date.now());
      setUser(newUser);
    } catch (error) {
      throw new Error("Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock login - in future replace with API call
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock authentication - in production this would validate against backend
      if (!email || !password) {
        throw new Error("Email and password required");
      }

      // Mock users database
      const mockUsers: User[] = [
        { id: "1", name: "Rahul Kumar", email: "rahul@student.edu", department: "CSE", role: "student" },
        { id: "2", name: "Prof. Sharma", email: "sharma@teacher.edu", department: "CSE", role: "teacher" },
        { id: "3", name: "Admin", email: "admin@college.edu", department: "Admin", role: "admin" },
      ];

      const foundUser = mockUsers.find((u) => u.email === email);
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }

      localStorage.setItem("user", JSON.stringify(foundUser));
      localStorage.setItem("authToken", "mock-token-" + Date.now());
      setUser(foundUser);
    } catch (error) {
      throw error;
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
