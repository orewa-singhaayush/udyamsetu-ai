"use client";

import React from "react";
import { X, ShieldCheck, Database, Lock, EyeOff } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-slate">
              <ShieldCheck className="w-5 h-5 text-brand-slate" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Data & Privacy Information</h3>
              <p className="text-xs text-slate-500">How UdyamSetu AI handles your venture data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <Database className="w-4 h-4 text-brand-orange" />
              <span>Project Data Storage</span>
            </div>
            <p className="text-[11px] text-slate-600">
              In this Pre-SIH prototype, business descriptions, approval checklists, and document records are stored strictly within the local SQLite database (<code className="bg-white px-1.5 py-0.5 rounded text-slate-800 font-mono">udyamsetu.db</code>) on your deployment host.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <Lock className="w-4 h-4 text-brand-orange" />
              <span>Document Upload Privacy</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Uploaded files (PDF, JPG, PNG) are isolated by project identifier in a protected server folder. They are not indexed by public search engines and are accessible only via authenticated streaming endpoints.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <EyeOff className="w-4 h-4 text-brand-orange" />
              <span>Zero External AI Data Sharing</span>
            </div>
            <p className="text-[11px] text-slate-600">
              All regulatory reasoning and semantic retrieval are powered by local SentenceTransformers and local Gemma 3 4B on Ollama. Your business ideas and financial budgets are never sent to third-party proprietary AI APIs.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-slate hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
