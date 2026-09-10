"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import PrivacyModal from "@/components/settings/PrivacyModal";
import DeleteAccountModal from "@/components/settings/DeleteAccountModal";
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Globe, 
  Bell, 
  Sparkles, 
  Eye, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Terminal, 
  Info,
  ExternalLink,
  Sliders
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false);

  // Entrepreneur preferences (persisted locally)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [detailedExplanations, setDetailedExplanations] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("udyamsetu_preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.emailNotifications === "boolean") setEmailNotifications(parsed.emailNotifications);
        if (typeof parsed.inAppNotifications === "boolean") setInAppNotifications(parsed.inAppNotifications);
        if (typeof parsed.detailedExplanations === "boolean") setDetailedExplanations(parsed.detailedExplanations);
        if (parsed.selectedLanguage) setSelectedLanguage(parsed.selectedLanguage);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save preferences
  const handleToggle = (key: string, value: boolean) => {
    let updated = {
      emailNotifications,
      inAppNotifications,
      detailedExplanations,
      selectedLanguage,
      [key]: value,
    };

    if (key === "emailNotifications") setEmailNotifications(value);
    if (key === "inAppNotifications") setInAppNotifications(value);
    if (key === "detailedExplanations") setDetailedExplanations(value);

    try {
      localStorage.setItem("udyamsetu_preferences", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account, preferences, and privacy
        </p>
      </div>

      {/* 1. ACCOUNT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          <User className="w-3.5 h-3.5 text-brand-orange" />
          <span>Account</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {/* Profile Card */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Profile Information</h3>
              <p className="text-xs text-slate-500">
                Update your name, contact phone, and primary business credentials.
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition self-start sm:self-center"
            >
              <span>Manage Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Email Card */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Account Email</h3>
              <p className="text-xs text-slate-500">
                The primary email address used for sign-in and compliance updates.
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-center">
              <span className="font-mono text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                {user?.email || "entrepreneur@udyamsetu.ai"}
              </span>
            </div>
          </div>

          {/* Password Card */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Password & Authentication</h3>
              <p className="text-xs text-slate-500">
                Keep your entrepreneur account secure with a strong password.
              </p>
            </div>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm transition self-start sm:self-center"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Security Card */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Session Security</h3>
              <p className="text-xs text-slate-500">
                Manage your active device session and authenticated state.
              </p>
            </div>
            <div className="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 self-start sm:self-center">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Session (This Browser)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PREFERENCES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          <Sliders className="w-3.5 h-3.5 text-brand-orange" />
          <span>Preferences</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {/* Language Preference */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Display Language</h3>
              <p className="text-xs text-slate-500">
                Select your preferred language for regulatory guidance and checklists.
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-center">
              <button
                onClick={() => setSelectedLanguage("en")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center space-x-1 ${
                  selectedLanguage === "en"
                    ? "bg-brand-slate text-white border-brand-slate shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-brand-orange" />
                <span>English</span>
              </button>
              <div className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-1">
                <span>हिंदी (Hindi)</span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded font-bold">Soon</span>
              </div>
              <div className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-1">
                <span>मराठी (Marathi)</span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded font-bold">Soon</span>
              </div>
            </div>
          </div>

          {/* Email Notifications Toggle */}
          <div className="p-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Email Notifications</h3>
              <p className="text-xs text-slate-500">
                Receive important compliance reminders and regulatory gazette updates.
              </p>
            </div>
            <button
              onClick={() => handleToggle("emailNotifications", !emailNotifications)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${
                emailNotifications ? "bg-brand-orange" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  emailNotifications ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* In-App Notifications Toggle */}
          <div className="p-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">In-App Notifications</h3>
              <p className="text-xs text-slate-500">
                Show badge alerts for missing documents and status transitions.
              </p>
            </div>
            <button
              onClick={() => handleToggle("inAppNotifications", !inAppNotifications)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${
                inAppNotifications ? "bg-brand-orange" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  inAppNotifications ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* AI Response Preferences */}
          <div className="p-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Detailed Regulatory Explanations</h3>
              <p className="text-xs text-slate-500">
                Synthesize comprehensive legal conditions and statutory excerpts in RAG responses.
              </p>
            </div>
            <button
              onClick={() => handleToggle("detailedExplanations", !detailedExplanations)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${
                detailedExplanations ? "bg-brand-orange" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  detailedExplanations ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRIVACY SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
          <span>Privacy</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {/* Data & Privacy */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Data & Privacy Information</h3>
              <p className="text-xs text-slate-500">
                Manage how your account and business project information is stored and handled.
              </p>
            </div>
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition self-start sm:self-center"
            >
              <span>View Privacy Information</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Delete Account (Destructive) */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-50/20">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-rose-900">Delete Account</h3>
              <p className="text-xs text-rose-700">
                Permanently remove your account, active ventures, and uploaded documents.
              </p>
            </div>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. ABOUT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          <Info className="w-3.5 h-3.5 text-brand-orange" />
          <span>About</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-slate-900">UdyamSetu AI</span>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  Version 1.0 (Pre-SIH Pilot)
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                AI-powered conversational guidance to discover and manage business approvals, registrations, and regulatory compliance requirements across Indian states.
              </p>
            </div>
          </div>

          {/* Expandable Regulatory Disclaimer */}
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition text-left"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-orange" />
                <span>Regulatory Disclaimer</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transform transition-transform duration-200 ${
                  disclaimerExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {disclaimerExpanded && (
              <div className="mt-2 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2 animate-in fade-in duration-150">
                <p>
                  UdyamSetu AI provides AI-assisted regulatory guidance and potential applicability information based on indexed government documents, not legally binding advice.
                </p>
                <p className="text-[11px] text-slate-500">
                  Approval thresholds, required forms, and fees are subject to gazette amendments. Users should verify important requirements with the relevant issuing authority before submitting formal applications or committing capital.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. DISCREET DEVELOPER STATUS LINK */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-600">
          <Terminal className="w-4 h-4 text-brand-slate" />
          <span>Need technical diagnostics or background service metrics?</span>
        </div>
        <Link
          href="/admin/system-status"
          className="inline-flex items-center space-x-1 font-bold text-brand-orange hover:text-brand-orange-hover hover:underline"
        >
          <span>View Developer System Status</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />

      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
