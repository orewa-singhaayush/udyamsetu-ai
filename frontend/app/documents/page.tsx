"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ProjectDocument, DocumentListResponse } from "@/types";
import ProgressCard from "@/components/ProgressCard";
import DocumentUploadModal from "@/components/DocumentUploadModal";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ExternalLink,
  FolderKanban,
  Sparkles,
  Search,
  Filter,
  Loader2
} from "lucide-react";

export default function DocumentsPage() {
  const { currentProject } = useAuth();
  const [data, setData] = useState<DocumentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);
  const [filter, setFilter] = useState<string>("all"); // 'all' | 'missing' | 'uploaded'
  const [searchQuery, setSearchQuery] = useState("");

  const loadDocuments = () => {
    if (currentProject) {
      setLoading(true);
      api.getDocuments(currentProject.id)
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentProject]);

  if (!currentProject) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <FolderKanban className="w-10 h-10 text-brand-orange mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No Active Project Selected</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please analyze a business or select an existing project to manage its required compliance documents.
          </p>
          <div className="pt-2">
            <Link
              href="/analyze"
              className="inline-flex items-center space-x-2 bg-brand-orange text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition"
            >
              <span>Analyze Business Idea</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const documents = data?.documents || [];
  const stats = data?.stats || { total: 0, uploaded: 0, missing: 0, needs_review: 0, progress_pct: 0 };

  // Filter and search
  const filteredDocs = documents.filter((doc) => {
    if (filter === "missing" && doc.status !== "missing") return false;
    if (filter === "uploaded" && doc.status !== "uploaded") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.document_name.toLowerCase().includes(q) ||
        doc.approval_name.toLowerCase().includes(q) ||
        doc.document_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by approval_name
  const groupedDocs: Record<string, ProjectDocument[]> = {};
  filteredDocs.forEach((doc) => {
    const key = doc.approval_name || "General Business Documents";
    if (!groupedDocs[key]) groupedDocs[key] = [];
    groupedDocs[key].push(doc);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            <FileText className="w-3.5 h-3.5" />
            <span>Document Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Required Documents Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Project: <strong className="text-slate-800">{currentProject.name}</strong> • Official regulatory requirements
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <ProgressCard
        totalDocs={stats.total}
        uploadedDocs={stats.uploaded}
        totalApprovals={Object.keys(groupedDocs).length}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex items-center space-x-2 w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === "all" ? "bg-brand-slate text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Documents ({stats.total})
          </button>
          <button
            onClick={() => setFilter("missing")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === "missing" ? "bg-brand-slate text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Pending ({stats.missing})
          </button>
          <button
            onClick={() => setFilter("uploaded")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === "uploaded" ? "bg-brand-slate text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Uploaded ({stats.uploaded})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>
      </div>

      {/* Document List Grouped by Approval */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
          <p className="text-xs">Loading document checklists...</p>
        </div>
      ) : Object.keys(groupedDocs).length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-700">No documents found</p>
          <p className="text-xs text-slate-500">
            {searchQuery ? "Try clearing your search query." : "No document requirements generated for this project."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocs).map(([approvalName, docs]) => {
            const uploadedInGroup = docs.filter((d) => d.status === "uploaded").length;
            const isGroupComplete = uploadedInGroup === docs.length;

            return (
              <div
                key={approvalName}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Section Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{approvalName}</h3>
                    <p className="text-[11px] text-slate-500">
                      {uploadedInGroup} of {docs.length} requirements fulfilled
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                    isGroupComplete ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-brand-orange"
                  }`}>
                    {isGroupComplete ? "Complete" : `${docs.length - uploadedInGroup} Pending`}
                  </span>
                </div>

                {/* Items in this approval */}
                <div className="divide-y divide-slate-100">
                  {docs.map((doc) => {
                    const isUploaded = doc.status === "uploaded";

                    return (
                      <div
                        key={doc.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                      >
                        <div className="flex items-start space-x-3.5">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                            isUploaded
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "border-2 border-dashed border-slate-300 text-slate-400"
                          }`}>
                            {isUploaded ? "✓" : "○"}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                                {doc.document_name}
                              </h4>
                              {doc.is_required ? (
                                <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-semibold border border-red-100">
                                  Mandatory
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                  Conditional
                                </span>
                              )}
                            </div>

                            {doc.requirement_description && (
                              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                                {doc.requirement_description}
                              </p>
                            )}

                            {isUploaded && doc.file_name && (
                              <div className="flex items-center space-x-3 text-[11px] text-emerald-700 font-medium pt-1">
                                <span className="flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Uploaded: {doc.file_name}</span>
                                </span>
                                {doc.file_size && (
                                  <span className="text-slate-400">({(doc.file_size / 1024).toFixed(0)} KB)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                          {isUploaded ? (
                            <>
                              <a
                                href={`http://localhost:8000${doc.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                              <button
                                onClick={() => setSelectedDoc(doc)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-brand-orange hover:bg-orange-50 rounded-xl border border-orange-200 transition"
                              >
                                <span>Replace</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl shadow-sm transition"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload Document</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {selectedDoc && (
        <DocumentUploadModal
          document={selectedDoc}
          projectId={currentProject.id}
          isOpen={true}
          onClose={() => setSelectedDoc(null)}
          onSuccess={() => loadDocuments()}
        />
      )}
    </div>
  );
}
