"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Bot, 
  FolderKanban 
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";
  if (isPublicPage) return null;

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Approvals", href: "/approvals", icon: CheckSquare },
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "AI Guide", href: "/ai-assistant", icon: Bot },
    { label: "Projects", href: "/projects", icon: FolderKanban },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
                isActive ? "text-brand-orange" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
