"use client";

import React from "react";
import { 
  FileCheck2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";

interface Props {
  totalDocs: number;
  uploadedDocs: number;
  totalApprovals?: number;
  completedApprovals?: number;
  className?: string;
}

export default function ProgressCard({
  totalDocs,
  uploadedDocs,
  totalApprovals = 0,
  completedApprovals = 0,
  className = "",
}: Props) {
  const docPct = totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;
  const missingDocs = Math.max(0, totalDocs - uploadedDocs);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900">Project Compliance Progress</h3>
          <p className="text-xs text-slate-500">Document readiness and approval tracking</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-brand-orange">{docPct}%</span>
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Ready</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-brand-orange h-full rounded-full transition-all duration-500"
            style={{ width: `${docPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{uploadedDocs} of {totalDocs} documents uploaded</span>
          <span>{missingDocs} remaining</span>
        </div>
      </div>

      {/* Breakdown Pills */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
          <div className="flex items-center justify-center space-x-1 text-emerald-700 font-bold text-base">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadedDocs}</span>
          </div>
          <span className="text-[11px] font-medium text-emerald-600 block mt-0.5">Uploaded</span>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
          <div className="flex items-center justify-center space-x-1 text-amber-700 font-bold text-base">
            <Clock className="w-4 h-4" />
            <span>{missingDocs}</span>
          </div>
          <span className="text-[11px] font-medium text-amber-600 block mt-0.5">Pending</span>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
          <div className="flex items-center justify-center space-x-1 text-blue-700 font-bold text-base">
            <FileCheck2 className="w-4 h-4" />
            <span>{totalApprovals}</span>
          </div>
          <span className="text-[11px] font-medium text-blue-600 block mt-0.5">Approvals</span>
        </div>
      </div>
    </div>
  );
}
