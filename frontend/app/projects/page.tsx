"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Project } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { 
  FolderKanban, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Building2, 
  MapPin, 
  FileText, 
  CheckSquare,
  Plus,
  Loader2
} from "lucide-react";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, currentProject, setCurrentProject } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = () => {
    if (!user) return;
    setLoading(true);
    api.getProjects(user.id)
      .then((res) => {
        setProjects(res.projects);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this business project? All uploaded documents and records will be removed.")) {
      return;
    }
    try {
      await api.deleteProject(projectId);
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
      loadProjects();
    } catch (err: any) {
      alert(err.message || "Failed to delete project.");
    }
  };

  const handleSelect = (project: Project) => {
    setCurrentProject(project);
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Project Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Your Business Ventures
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Each venture maintains an independent business profile, approval checklist, and document repository.
          </p>
        </div>

        <Link
          href="/analyze"
          className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Business Venture</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
          <p className="text-xs">Loading your projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center text-brand-orange mx-auto">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">No Projects Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Analyze a business idea to generate your first venture with custom compliance checklists.
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center space-x-2 bg-brand-orange text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Your First Business</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => {
            const stats = proj.stats || { total_documents: 0, uploaded_documents: 0, total_approvals: 0, completed_approvals: 0, document_progress_pct: 0 };
            const isActive = currentProject?.id === proj.id;

            return (
              <div
                key={proj.id}
                onClick={() => handleSelect(proj)}
                className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-5 ${
                  isActive ? "border-brand-orange ring-1 ring-brand-orange" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {proj.industry || "General"}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            Active Project
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {proj.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, proj.id)}
                      title="Delete Project"
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Attributes */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="capitalize">{proj.business_subtype || proj.business_type || "Unit"}</span>
                    </div>
                    {proj.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proj.location}</span>
                      </div>
                    )}
                    {proj.budget && (
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(proj.budget)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Document Readiness</span>
                      <span className="font-bold text-brand-orange">{stats.document_progress_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-orange h-full rounded-full transition-all"
                        style={{ width: `${stats.document_progress_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{stats.total_approvals} Approvals</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{stats.uploaded_documents}/{stats.total_documents} Docs</span>
                      </span>
                    </div>

                    <span className="font-bold text-brand-orange inline-flex items-center space-x-1 text-xs hover:underline">
                      <span>Open Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
