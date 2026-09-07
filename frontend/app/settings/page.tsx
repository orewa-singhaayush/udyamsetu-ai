"use client";

import React from "react";
import { Settings, Shield, Bell, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900">Application Settings</h1>
        <p className="text-xs text-slate-500">Configure environment, AI service, and notifications</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800">Service Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">FastAPI Backend URL</p>
                <p className="text-[11px] text-slate-500">http://localhost:8000</p>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Local LLM Runtime</p>
                <p className="text-[11px] text-slate-500">Ollama / Gemma 3 4B</p>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Knowledge Base Chunks</p>
                <p className="text-[11px] text-slate-500">1,165 regulatory chunks (Food, GST, MSME, Textile)</p>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                Indexed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
