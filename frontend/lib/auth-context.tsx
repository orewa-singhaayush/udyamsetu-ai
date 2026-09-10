"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Project } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    // 1. Restore authenticated user
    let activeUser: User | null = null;
    const savedUserStr = localStorage.getItem("udyamsetu_user");
    if (savedUserStr) {
      try {
        activeUser = JSON.parse(savedUserStr);
        setUser(activeUser);
      } catch {
        localStorage.removeItem("udyamsetu_user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    // 2. Restore project ONLY if it belongs to the active user
    const savedProjectStr = localStorage.getItem("udyamsetu_project");
    if (savedProjectStr) {
      try {
        const savedProj = JSON.parse(savedProjectStr);
        if (activeUser && savedProj && savedProj.user_id === activeUser.id) {
          setCurrentProject(savedProj);
        } else {
          localStorage.removeItem("udyamsetu_project");
          setCurrentProject(null);
        }
      } catch {
        localStorage.removeItem("udyamsetu_project");
        setCurrentProject(null);
      }
    } else {
      setCurrentProject(null);
    }
  }, []);

  const handleSetCurrentProject = (project: Project | null) => {
    if (project) {
      // Validate that project belongs to active user before storing
      if (user && project.user_id === user.id) {
        setCurrentProject(project);
        localStorage.setItem("udyamsetu_project", JSON.stringify(project));
      }
    } else {
      setCurrentProject(null);
      localStorage.removeItem("udyamsetu_project");
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    const userRes = await api.login(email, pass);
    const loggedInUser: User = {
      id: userRes.id,
      email: userRes.email,
      full_name: userRes.full_name,
      role: userRes.role || "entrepreneur",
      phone: userRes.phone || (userRes.id === "user-default-1" ? "+91 98765 43210" : ""),
      business_name: userRes.business_name || (userRes.id === "user-default-1" ? "Singh Dairy & Agro Industries" : ""),
    };

    setUser(loggedInUser);
    localStorage.setItem("udyamsetu_user", JSON.stringify(loggedInUser));

    // Clear or revalidate saved project for this user
    const savedProjectStr = localStorage.getItem("udyamsetu_project");
    if (savedProjectStr) {
      try {
        const savedProj = JSON.parse(savedProjectStr);
        if (savedProj.user_id !== loggedInUser.id) {
          localStorage.removeItem("udyamsetu_project");
          setCurrentProject(null);
        } else {
          setCurrentProject(savedProj);
        }
      } catch {
        localStorage.removeItem("udyamsetu_project");
        setCurrentProject(null);
      }
    } else {
      setCurrentProject(null);
    }

    return true;
  };

  const signup = async (name: string, email: string, pass: string): Promise<boolean> => {
    const userRes = await api.signup(name, email, pass);
    const newUser: User = {
      id: userRes.id,
      email: userRes.email,
      full_name: userRes.full_name,
      role: userRes.role || "entrepreneur",
    };

    setUser(newUser);
    localStorage.setItem("udyamsetu_user", JSON.stringify(newUser));

    // Newly registered user has 0 projects
    localStorage.removeItem("udyamsetu_project");
    setCurrentProject(null);
    return true;
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const updated: User = {
      ...user,
      ...data,
    };
    setUser(updated);
    localStorage.setItem("udyamsetu_user", JSON.stringify(updated));
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
        updateProfile,
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
