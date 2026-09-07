"use client";

import React from "react";
import Link from "next/link";
import { Approval } from "@/types";
import { 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight, 
  Building2, 
  BookOpen,
  AlertCircle,
  FileCheck
} from "lucide-react";

interface Props {
  approval: Approval;
  projectId?: string;
  index?: number;
  onStatusChange?: (newStatus: string) => void;
}

export default function ApprovalCard({ approval, projectId, index, onStatusChange }: Props) {
  const hasRagKnowledge = approval.rag_domain && approval.sources && approval.sources.length > 0;
  const isUnconfigured = approval.rag_domain === "fire" || approval.rag_domain === "pollution";

  // Slug for URL link
  const approvalSlug = approval.id || encodeURIComponent(approval.approval_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-brand-slate font-bold text-xs flex-shrink-0 mt-0.5 border border-slate-200">
            {index !== undefined ? index + 1 : "✓"}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-snug">
              {approval.approval_name}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{approval.authority || "Regulatory Authority"}</span>
            </div>
          </div>
        </div>

        {/* Applicability Badge */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
            Potentially Applicable
          </span>
          {hasRagKnowledge && (
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Grounded</span>
            </span>
          )}
          {isUnconfigured && (
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
              Guidance Pending
            </span>
          )}
        </div>
      </div>

      {/* Applicability conditions */}
      {approval.conditions && approval.conditions.length > 0 && (
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
          <p className="font-semibold text-slate-700">Applicability Context:</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
            {approval.conditions.map((cond, i) => (
              <li key={i}>{cond}</li>
            ))}
          </ul>
        </div>
      )}

      {/* RAG Preview / Brief */}
      {approval.rag_answer && (
        <div className="text-xs text-slate-700 space-y-1.5 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
              <span>Regulatory Summary</span>
            </span>
            {approval.sources && approval.sources.length > 0 && (
              <span className="text-emerald-700 font-medium lowercase">
                {approval.sources.length} sources retrieved
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-slate-600 leading-relaxed font-sans">
            {approval.rag_answer.replace(/^Answer:\s*/i, "").slice(0, 200)}...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-400 text-[11px]">
          Domain: <span className="font-medium text-slate-600 uppercase">{approval.rag_domain || "General"}</span>
        </span>

        <Link
          href={`/approvals/${approvalSlug}${projectId ? `?projectId=${projectId}` : ""}`}
          className="inline-flex items-center space-x-1.5 font-semibold text-brand-orange hover:text-brand-orange-hover hover:underline"
        >
          <span>View Regulatory Details</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
