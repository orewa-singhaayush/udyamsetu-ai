"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { User, ShieldCheck, Mail, Building2, Award } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900">Entrepreneur Profile</h1>
        <p className="text-xs text-slate-500">Manage your business owner profile and credentials</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-slate text-white text-xl font-bold flex items-center justify-center">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{user?.full_name || "Entrepreneur"}</h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <span className="inline-block text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Verified {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px]">Account ID</span>
            <span className="font-mono font-bold text-slate-800">{user?.id}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 block text-[11px]">Compliance Level</span>
            <span className="font-bold text-slate-800">Pre-SIH Pilot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
