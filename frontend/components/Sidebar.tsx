"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  FolderKanban, 
  CheckSquare, 
  FileText, 
  Bot, 
  User, 
  Settings,
  ShieldCheck,
  HelpCircle
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Analyze Business", href: "/analyze", icon: Sparkles, badge: "AI" },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Approvals", href: "/approvals", icon: CheckSquare },
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "AI Assistant", href: "/ai-assistant", icon: Bot },
  ];

  const secondaryItems = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex-shrink-0">
      {/* Primary Navigation */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
          Platform
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-brand-slate text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-orange" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isActive ? "bg-brand-orange text-white" : "bg-orange-100 text-brand-orange"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Secondary Navigation */}
      <div className="mt-8 space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
          Account
        </p>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                isActive
                  ? "bg-brand-slate text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-brand-orange" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Regulatory Advisory Notice Card */}
      <div className="mt-auto pt-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
            <span>Advisory AI System</span>
          </div>
          <p className="leading-relaxed text-slate-500 text-[10px]">
            Guidance is grounded in official gazettes and regulatory frameworks. Always verify with concerned authorities.
          </p>
        </div>
      </div>
    </aside>
  );
}
