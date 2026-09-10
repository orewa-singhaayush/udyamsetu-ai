"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Project } from "@/types";
import { 
  Building2, 
  Sparkles, 
  FolderKanban, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, currentProject, setCurrentProject, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getProjects(user.id)
        .then((res) => {
          setProjects(res.projects);
          if (res.projects.length === 0) {
            setCurrentProject(null);
          } else if (currentProject && !res.projects.some((p) => p.id === currentProject.id)) {
            setCurrentProject(res.projects[0]);
          } else if (!currentProject && res.projects.length > 0) {
            setCurrentProject(res.projects[0]);
          }
        })
        .catch(() => {
          setProjects([]);
          setCurrentProject(null);
        });
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user]);

  // Don't show full navbar on landing, login, signup
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

  return (
    <header className="bg-brand-slate text-white sticky top-0 z-40 border-b border-brand-slate-light shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link href={isPublicPage ? "/" : "/dashboard"} className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center font-bold text-white shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">UDYAMSETU AI</span>
                <span className="hidden sm:inline-block ml-2 text-xs bg-brand-slate-light text-slate-200 px-2 py-0.5 rounded font-medium border border-slate-600">
                  Govt Compliance MVP
                </span>
              </div>
            </Link>
          </div>

          {/* Project Switcher & Actions (for App pages) */}
          {!isPublicPage && (
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Project Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-brand-slate-light hover:bg-slate-700 text-sm px-3 py-1.5 rounded-lg border border-slate-600 transition"
                >
                  <FolderKanban className="w-4 h-4 text-brand-orange" />
                  <span className="max-w-[140px] sm:max-w-[200px] truncate font-medium">
                    {currentProject ? currentProject.name : "Select Project"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Your Projects
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {projects.length === 0 ? (
                        <div className="px-3 py-3 text-xs text-slate-500 text-center">
                          No active projects found.
                        </div>
                      ) : (
                        projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setCurrentProject(p);
                              setDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition"
                          >
                            <span className="truncate font-medium text-slate-800">{p.name}</span>
                            {currentProject?.id === p.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange flex-shrink-0 ml-2" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t border-slate-100 pt-1 px-2">
                      <Link
                        href="/analyze"
                        onClick={() => setDropdownOpen(false)}
                        className="block text-center text-xs text-brand-orange hover:text-brand-orange-hover font-semibold py-1.5 rounded hover:bg-orange-50 transition"
                      >
                        + Analyze New Business
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Analyze Button */}
              <Link
                href="/analyze"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze</span>
              </Link>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-brand-orange transition"
                >
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name || "Entrepreneur"}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-brand-orange border border-orange-200/60 px-2 py-0.5 rounded-md">
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Entrepreneur"}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push("/");
                        }}
                        className="w-full text-left flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Landing page Auth Buttons */}
          {isPublicPage && (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded transition"
              >
                Sign In
              </Link>
              <Link
                href="/analyze"
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                Analyze Business
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
