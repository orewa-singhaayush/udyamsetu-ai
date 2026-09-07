"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Project, ProjectDocument, Approval } from "@/types";
import ProgressCard from "@/components/ProgressCard";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import ApprovalCard from "@/components/ApprovalCard";
import DocumentUploadModal from "@/components/DocumentUploadModal";
import { 
  FolderKanban, 
  ArrowLeft, 
  Sparkles, 
  CheckSquare, 
  FileText, 
  Bot, 
  UploadCloud, 
  Download,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setCurrentProject } = useAuth();
  const projectId = params.id as string;

  const [data, setData] = useState<{
    project: Project;
    business_profile: any;
    approvals: Approval[];
    documents: ProjectDocument[];
    stats: any;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"approvals" | "documents" | "profile">("approvals");
  const [loading, setLoading] = useState(true);
  const [selectedDocForUpload, setSelectedDocForUpload] = useState<ProjectDocument | null>(null);

  const loadData = () => {
    setLoading(true);
    api.getProject(projectId)
      .then((res) => {
        setData(res);
        setCurrentProject(res.project);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-orange" />
        <p className="text-xs">Loading project details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Project Not Found</h2>
        <Link href="/projects" className="text-xs text-brand-orange hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  const { project, business_profile, approvals, documents, stats } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Back Link */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Ventures</span>
        </Link>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase bg-orange-100 text-brand-orange px-2.5 py-0.5 rounded-full">
                {project.industry || "General"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 capitalize">
                {project.business_subtype || project.business_type || "Manufacturing"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-xs text-slate-500 max-w-2xl font-sans italic">
                &ldquo;{project.description}&rdquo;
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/ai-assistant?projectId=${project.id}`}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-slate text-white text-xs font-bold rounded-xl shadow-sm hover:bg-slate-800 transition"
            >
              <Bot className="w-3.5 h-3.5 text-brand-orange" />
              <span>Ask AI Guide</span>
            </Link>
          </div>
        </div>

        {/* Progress Card Component */}
        <ProgressCard
          totalDocs={stats.total_documents}
          uploadedDocs={stats.uploaded_documents}
          totalApprovals={stats.total_approvals}
          completedApprovals={stats.completed_approvals}
        />
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
            activeTab === "approvals"
              ? "bg-brand-slate text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Approvals Checklist ({approvals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
            activeTab === "documents"
              ? "bg-brand-slate text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Required Documents ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
            activeTab === "profile"
              ? "bg-brand-slate text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>
      </div>

      {/* Tab 1: Approvals */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvals.map((appr, i) => (
              <ApprovalCard
                key={appr.id || i}
                approval={appr}
                projectId={project.id}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {documents.map((doc) => {
            const isUploaded = doc.status === "uploaded";
            return (
              <div
                key={doc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUploaded ? "bg-emerald-500 text-white" : "border border-slate-300 text-slate-400 bg-slate-100"
                  }`}>
                    {isUploaded ? "✓" : "○"}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">{doc.document_name}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">
                        {doc.document_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.approval_name}</p>
                    {isUploaded && doc.file_name && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        File: {doc.file_name} ({(doc.file_size ? doc.file_size / 1024 : 0).toFixed(0)} KB)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                  {isUploaded ? (
                    <>
                      <a
                        href={`http://localhost:8000${doc.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => setSelectedDocForUpload(doc)}
                        className="text-xs font-semibold text-brand-orange hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
                      >
                        Replace
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedDocForUpload(doc)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl shadow-sm transition"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Business Profile */}
      {activeTab === "profile" && business_profile && (
        <BusinessProfileCard profile={business_profile} />
      )}

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
