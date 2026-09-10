"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Approval } from "@/types";
import ApprovalCard from "@/components/ApprovalCard";
import { 
  CheckSquare, 
  Sparkles, 
  Filter, 
  FolderKanban, 
  Building2,
  AlertCircle,
  Loader2 
} from "lucide-react";

export default function ApprovalsPage() {
  const { currentProject } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (currentProject) {
      setLoading(true);
      api.getApprovals(currentProject.id)
        .then((res) => {
          setApprovals(res.approvals);
          setLoading(false);
        })
        .catch(() => {
          setApprovals([]);
          setLoading(false);
        });
    } else {
      setApprovals([]);
      setLoading(false);
    }
  }, [currentProject]);

  const filteredApprovals = approvals.filter((a) => {
    if (filter === "all") return true;
    if (filter === "grounded") return a.sources && a.sources.length > 0;
    if (filter === "completed") return a.status === "completed";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Compliance Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Potential Approvals & Registrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentProject ? `Assessed approvals for ${currentProject.name}` : "Checklist of identified business licenses"}
          </p>
        </div>

        {/* Action button */}
        <Link
          href="/analyze"
          className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze New Business</span>
        </Link>
      </div>

      {/* No active project state */}
      {!currentProject && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center text-brand-orange mx-auto">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">No Active Project Selected</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Analyze a business idea or select an existing project from the top navbar to view mapped approvals.
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center space-x-2 bg-brand-orange text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
          >
            <span>Analyze Business Now</span>
          </Link>
        </div>
      )}

      {/* Loaded approvals */}
      {currentProject && (
        <div className="space-y-6">
          {/* Filter tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl transition ${
                filter === "all" ? "bg-brand-slate text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Approvals ({approvals.length})
            </button>
            <button
              onClick={() => setFilter("grounded")}
              className={`px-3 py-1.5 rounded-xl transition ${
                filter === "grounded" ? "bg-brand-slate text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              With Regulatory Sources
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
              <p className="text-xs">Loading approvals...</p>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-500 text-xs">
              No approvals match the current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApprovals.map((appr, i) => (
                <ApprovalCard
                  key={appr.id || i}
                  approval={appr}
                  projectId={currentProject.id}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
