"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { X, AlertTriangle, Trash2, Loader2, ShieldAlert } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirmText.toLowerCase() !== "delete") {
      setError("Please type 'delete' to confirm account removal.");
      return;
    }

    setDeleting(true);
    setError(null);

    // In Pre-SIH mock mode, clear session and redirect with explanation
    setTimeout(() => {
      logout();
      setDeleting(false);
      onClose();
      router.push("/signup");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Delete Account</h3>
              <p className="text-xs text-slate-500">Irreversible account removal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200/80 text-rose-900 space-y-1.5">
            <p className="font-bold">Are you sure you want to delete your account?</p>
            <p className="text-[11px] leading-relaxed text-rose-800">
              Your entrepreneur profile, active business projects, approval records, and uploaded compliance documents may be permanently removed.
            </p>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-slate-700">
              Type <strong className="text-rose-600">delete</strong> below to proceed:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600">{error}</p>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 flex items-start space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>In production with Supabase Auth, account deletion initiates a soft-delete grace period before purge.</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
