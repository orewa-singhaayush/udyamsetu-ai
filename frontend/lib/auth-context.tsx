"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Project } from "@/types";

interface AuthContextType {
  user: User | null;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEFAULT_USER: User = {
  id: "user-default-1",
  email: "entrepreneur@udyamsetu.ai",
  full_name: "Aayush Singh",
  role: "entrepreneur",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    // Check localStorage
    const savedUser = localStorage.getItem("udyamsetu_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEFAULT_USER);
      }
    } else {
      localStorage.setItem("udyamsetu_user", JSON.stringify(DEFAULT_USER));
    }

    const savedProject = localStorage.getItem("udyamsetu_project");
    if (savedProject) {
      try {
        setCurrentProject(JSON.parse(savedProject));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSetCurrentProject = (project: Project | null) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem("udyamsetu_project", JSON.stringify(project));
    } else {
      localStorage.removeItem("udyamsetu_project");
    }
  };

  const login = async (email: string, _pass: string): Promise<boolean> => {
    const newUser: User = {
      id: "user-default-1",
      email: email || "entrepreneur@udyamsetu.ai",
      full_name: email.split("@")[0] || "Entrepreneur",
      role: "entrepreneur",
    };
    setUser(newUser);
    localStorage.setItem("udyamsetu_user", JSON.stringify(newUser));
    return true;
  };

  const signup = async (name: string, email: string, _pass: string): Promise<boolean> => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email,
      full_name: name || "Entrepreneur",
      role: "entrepreneur",
    };
    setUser(newUser);
    localStorage.setItem("udyamsetu_user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentProject(null);
    localStorage.removeItem("udyamsetu_user");
    localStorage.removeItem("udyamsetu_project");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentProject,
        setCurrentProject: handleSetCurrentProject,
        login,
        signup,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
