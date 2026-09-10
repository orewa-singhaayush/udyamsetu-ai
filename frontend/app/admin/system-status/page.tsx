"use client";

import React from "react";
import Link from "next/link";
import SystemStatusCard from "@/components/SystemStatusCard";
import { ArrowLeft, ShieldCheck, Terminal, Cpu } from "lucide-react";

export default function SystemStatusPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Breadcrumb / Back Link */}
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-brand-orange" />
          <span>Technical Diagnostics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Developer & System Status</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Underlying AI backend services, local LLM execution pipelines, and regulatory knowledge bases.
        </p>
      </div>

      <SystemStatusCard />

      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <p className="font-bold text-slate-800">Administrator Notice:</p>
        <p className="text-[11px] leading-relaxed">
          This system diagnostics screen is isolated from the entrepreneur settings area. To inspect live API traffic or monitor background tasks, run <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono">manage_task status</code> or view the uvicorn log.
        </p>
      </div>
    </div>
  );
}
