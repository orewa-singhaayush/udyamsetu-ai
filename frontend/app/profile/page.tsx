"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Project } from "@/types";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Edit3, 
  Lock, 
  LogOut, 
  FolderKanban, 
  CheckSquare, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Business overview metrics
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      setLoadingStats(true);
      api.getProjects(user.id)
        .then((res) => {
          setProjects(res.projects || []);
          setLoadingStats(false);
        })
        .catch(() => {
          setProjects([]);
          setLoadingStats(false);
        });
    } else {
      setLoadingStats(false);
    }
  }, [user]);

  // Aggregate stats from real projects
  const activeProjectsCount = projects.length;
  const totalApprovalsCount = projects.reduce((acc, p) => acc + (p.stats?.total_approvals || 0), 0);
  const totalDocsCount = projects.reduce((acc, p) => acc + (p.stats?.total_documents || 0), 0);
  const uploadedDocsCount = projects.reduce((acc, p) => acc + (p.stats?.uploaded_documents || 0), 0);

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out of your entrepreneur session?")) {
      logout();
      router.push("/login");
    }
  };

  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "E";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Entrepreneur Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account information and business profile
        </p>
      </div>

      {/* 1. Profile Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-brand-slate text-white text-2xl font-black flex items-center justify-center shadow-md border-2 border-slate-100 flex-shrink-0">
              {initial}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {user?.full_name || "Entrepreneur"}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || "entrepreneur@udyamsetu.ai"}</span>
              </div>
              <div className="pt-1 flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Entrepreneur"}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  ID: <span className="font-mono text-slate-600">{user?.id}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold shadow-sm transition self-start sm:self-center"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. Personal Information Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900">Personal Information</h3>
          <p className="text-xs text-slate-500">Verified identity and business ownership credentials</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Full Name
            </span>
            <p className="text-sm font-bold text-slate-800">
              {user?.full_name || "Aayush Singh"}
            </p>
          </div>

          {/* Email Address */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Email Address
            </span>
            <p className="text-sm font-bold text-slate-800">
              {user?.email || "entrepreneur@udyamsetu.ai"}
            </p>
          </div>

          {/* Phone */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Phone Number
            </span>
            <p className="text-sm font-bold text-slate-800">
              {user?.phone || "Not provided"}
            </p>
          </div>

          {/* Business Name */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Primary Business Name
            </span>
            <p className="text-sm font-bold text-slate-800">
              {user?.business_name || "Not provided"}
            </p>
          </div>

          {/* Role */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Platform Role
            </span>
            <p className="text-sm font-bold text-slate-800 capitalize">
              {user?.role || "Entrepreneur"}
            </p>
          </div>

          {/* Account Status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Account Status
            </span>
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Entrepreneur</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Business Overview Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900">Business Overview</h3>
          <p className="text-xs text-slate-500">
            Account-level compliance statistics across all registered ventures
          </p>
        </div>

        {loadingStats ? (
          <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
            <span>Calculating account compliance metrics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Active Projects */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center mx-auto">
                <FolderKanban className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeProjectsCount > 0 ? activeProjectsCount : "—"}
              </p>
              <span className="text-[11px] font-semibold text-slate-500 block">
                Active Projects
              </span>
            </div>

            {/* Potential Approvals */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <CheckSquare className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeProjectsCount > 0 ? totalApprovalsCount : "—"}
              </p>
              <span className="text-[11px] font-semibold text-slate-500 block">
                Potential Approvals
              </span>
            </div>

            {/* Total Required Documents */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeProjectsCount > 0 ? totalDocsCount : "—"}
              </p>
              <span className="text-[11px] font-semibold text-slate-500 block">
                Required Documents
              </span>
            </div>

            {/* Completed Documents */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeProjectsCount > 0 ? uploadedDocsCount : "—"}
              </p>
              <span className="text-[11px] font-semibold text-slate-500 block">
                Completed Documents
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Security Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900">Security</h3>
          <p className="text-xs text-slate-500">Manage account credentials and session access</p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Email row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-3">
            <div>
              <p className="font-bold text-slate-800">Account Email</p>
              <p className="text-[11px] text-slate-500">{user?.email || "entrepreneur@udyamsetu.ai"}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              Primary Sign-In
            </span>
          </div>

          {/* Password row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-3">
            <div>
              <p className="font-bold text-slate-800">Password</p>
              <p className="text-[11px] text-slate-500 font-mono tracking-widest">••••••••</p>
            </div>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition self-start sm:self-auto shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Active Session row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-3">
            <div>
              <p className="font-bold text-slate-800">Active Session</p>
              <p className="text-[11px] text-slate-500">Current browser local session (Pre-SIH Pilot Mode)</p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold transition self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
