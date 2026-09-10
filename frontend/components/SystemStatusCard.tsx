"use client";

import React from "react";
import { Server, Cpu, Database, Layers, CheckCircle2 } from "lucide-react";

interface Props {
  className?: string;
}

export default function SystemStatusCard({ className = "" }: Props) {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 ${className}`}>
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-slate text-white flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">System & Engine Diagnostics</h3>
            <p className="text-xs text-slate-500">Technical infrastructure diagnostics & AI knowledge base status</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center space-x-3">
            <Server className="w-4 h-4 text-slate-500" />
            <div>
              <p className="font-bold text-slate-800">FastAPI Backend</p>
              <p className="text-[11px] text-slate-500">http://127.0.0.1:8000 (REST API & Supervisor pipeline)</p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Connected</span>
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center space-x-3">
            <Cpu className="w-4 h-4 text-slate-500" />
            <div>
              <p className="font-bold text-slate-800">Local LLM Runtime</p>
              <p className="text-[11px] text-slate-500">Ollama / Gemma 3 4B (Direct HTTP API with CLI fallback)</p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center space-x-3">
            <Layers className="w-4 h-4 text-slate-500" />
            <div>
              <p className="font-bold text-slate-800">Regulatory Knowledge Base</p>
              <p className="text-[11px] text-slate-500">1,165 embedded chunks (Food 351, GST 434, MSME 169, Textile 211)</p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Indexed</span>
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center space-x-3">
            <Database className="w-4 h-4 text-slate-500" />
            <div>
              <p className="font-bold text-slate-800">Relational Store</p>
              <p className="text-[11px] text-slate-500">SQLite persistence engine (backend/data/udyamsetu.db)</p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Operational</span>
          </span>
        </div>
      </div>
    </div>
  );
}
