"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Project, ProjectDocument, Approval } from "@/types";
import ProgressCard from "@/components/ProgressCard";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import DocumentUploadModal from "@/components/DocumentUploadModal";
import { 
  Sparkles, 
  CheckSquare, 
  FileText, 
  Bot, 
  FolderKanban, 
  ArrowRight, 
  Upload, 
  Plus, 
  ExternalLink,
  Building2,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const { user, currentProject, setCurrentProject } = useAuth();
  const [projectData, setProjectData] = useState<{
    project: Project;
    business_profile: any;
    approvals: Approval[];
    documents: ProjectDocument[];
    stats: any;
  } | null>(null);

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocForUpload, setSelectedDocForUpload] = useState<ProjectDocument | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const projRes = await api.getProjects(user.id);
      setAllProjects(projRes.projects);

      if (projRes.projects.length === 0) {
        setProjectData(null);
        if (currentProject) setCurrentProject(null);
      } else {
        const matching = currentProject && projRes.projects.find((p) => p.id === currentProject.id);
        const active = matching || projRes.projects[0];
        if (!matching) {
          setCurrentProject(active);
        }
        const fullData = await api.getProject(active.id);
        setProjectData(fullData);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, currentProject?.id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-orange" />
        <p className="text-xs">Loading compliance dashboard...</p>
      </div>
    );
  }

  // Empty state: no projects yet
  if (!projectData && allProjects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-brand-orange flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome to Your Compliance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              You haven&apos;t analyzed any business venture yet. Start by describing your business idea in simple language.
            </p>
          </div>
          <div>
            <Link
              href="/analyze"
              className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Your First Business</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { project, business_profile, approvals, documents, stats } = projectData || {
    project: currentProject!,
    business_profile: null,
    approvals: [],
    documents: [],
    stats: { total_documents: 0, uploaded_documents: 0, total_approvals: 0, completed_approvals: 0, document_progress_pct: 0 }
  };

  const pendingDocs = documents.filter((d) => d.status === "missing").slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Entrepreneur Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {project.name}
          </h1>
          <p className="text-xs text-slate-500">
            Sector: <strong className="text-slate-700 capitalize">{project.industry || "General"}</strong> • Location: <strong className="text-slate-700">{project.location || "Pune"}</strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/analyze"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze New</span>
          </Link>
          <Link
            href="/documents"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Document Center</span>
          </Link>
          <Link
            href="/ai-assistant"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition"
          >
            <Bot className="w-3.5 h-3.5 text-brand-orange" />
            <span>Ask Assistant</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compliance Progress */}
        <ProgressCard
          className="md:col-span-2"
          totalDocs={stats.total_documents}
          uploadedDocs={stats.uploaded_documents}
          totalApprovals={stats.total_approvals}
          completedApprovals={stats.completed_approvals}
        />

        {/* Active Projects Summary Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900">Your Ventures</span>
              <Link href="/projects" className="text-xs text-brand-orange font-bold hover:underline">
                View All ({allProjects.length})
              </Link>
            </div>
            <div className="space-y-2 mt-3 max-h-40 overflow-y-auto">
              {allProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentProject(p)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                    p.id === project.id
                      ? "bg-slate-50 border-brand-orange/40 font-bold text-slate-900"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === project.id && (
                    <span className="text-[10px] text-brand-orange bg-orange-50 px-1.5 py-0.5 rounded font-bold">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/analyze"
            className="w-full text-center py-2 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition block"
          >
            + New Venture
          </Link>
        </div>
      </div>

      {/* Business Profile Summary */}
      {business_profile && (
        <BusinessProfileCard profile={business_profile} />
      )}

      {/* Approvals and Pending Documents 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicable Approvals List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Potential Approvals Checklist</h3>
              <p className="text-[11px] text-slate-500">{approvals.length} licenses identified</p>
            </div>
            <Link
              href="/approvals"
              className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1"
            >
              <span>Full List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {approvals.slice(0, 4).map((appr) => (
              <div
                key={appr.id || appr.approval_name}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <p className="font-bold text-slate-800 truncate">{appr.approval_name}</p>
                  <p className="text-[11px] text-slate-500">{appr.authority}</p>
                </div>
                <Link
                  href={`/approvals/${appr.id || encodeURIComponent(appr.approval_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}?projectId=${project.id}`}
                  className="text-xs font-semibold text-brand-orange hover:underline whitespace-nowrap"
                >
                  Guidance →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Required Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pending Required Documents</h3>
              <p className="text-[11px] text-slate-500">{stats.total_documents - stats.uploaded_documents} remaining to complete</p>
            </div>
            <Link
              href="/documents"
              className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1"
            >
              <span>Document Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span>All documents are uploaded!</span>
              </div>
            ) : (
              pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-800 truncate">{doc.document_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{doc.approval_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDocForUpload(doc)}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-brand-orange font-semibold rounded-lg border border-slate-200 shadow-2xs whitespace-nowrap transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {selectedDocForUpload && (
        <DocumentUploadModal
          document={selectedDocForUpload}
          projectId={project.id}
          isOpen={true}
          onClose={() => setSelectedDocForUpload(null)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
