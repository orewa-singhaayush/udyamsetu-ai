"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Approval, ProjectDocument } from "@/types";
import DocumentUploadModal from "@/components/DocumentUploadModal";
import { 
  Building2, 
  ArrowLeft, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Upload,
  Layers,
  HelpCircle,
  Loader2
} from "lucide-react";

function ApprovalDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const projectId = searchParams.get("projectId");

  const [approval, setApproval] = useState<Approval | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocForUpload, setSelectedDocForUpload] = useState<ProjectDocument | null>(null);

  const loadData = () => {
    if (projectId) {
      setLoading(true);
      api.getProject(projectId)
        .then((data) => {
          // Find approval matching id or slug
          const match = data.approvals.find(
            (a) => a.id === id || encodeURIComponent(a.approval_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")) === id
          );
          if (match) {
            setApproval(match);
            // Filter documents for this approval
            const apprDocs = data.documents.filter((d) => d.approval_name === match.approval_name);
            setDocuments(apprDocs);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, projectId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-2">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-orange" />
        <p className="text-xs">Loading regulatory details...</p>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Approval Details Not Found</h2>
          <p className="text-xs text-slate-500">
            Please select an approval from an active project checklist.
          </p>
          <Link
            href="/approvals"
            className="inline-flex items-center space-x-2 text-xs font-bold text-brand-orange hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approvals</span>
          </Link>
        </div>
      </div>
    );
  }

  const isUnconfigured = approval.rag_domain === "fire" || approval.rag_domain === "pollution";

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Back link */}
      <div>
        <Link
          href={projectId ? `/projects/${projectId}` : "/approvals"}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Checklist</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 text-[11px] font-bold text-brand-orange bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 uppercase tracking-wider">
              {approval.rag_domain || "General"} Regulatory Framework
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {approval.approval_name}
            </h1>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Issuing Authority: <strong>{approval.authority}</strong></span>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              Potentially Applicable
            </span>
          </div>
        </div>

        {/* Why this may apply */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Why This May Apply to Your Business
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {approval.rag_query
              ? `Evaluated for: ${approval.rag_query}`
              : "This approval is mapped to enterprises operating within your sector and activity scope."}
          </p>
          {approval.conditions && approval.conditions.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">Conditions:</span>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                {approval.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Regulatory Guidance Card (AI Generated + Source Grounded) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Regulatory Guidance</h2>
              <p className="text-[11px] text-slate-400">Synthesized from official gazettes and regulatory orders</p>
            </div>
          </div>
          {approval.sources && approval.sources.length > 0 && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Source Grounded</span>
            </span>
          )}
        </div>

        {isUnconfigured ? (
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold text-sm">Detailed regulatory guidance is not yet available for this approval.</p>
            <p className="leading-relaxed">
              Approval mapping is identified based on your business activities, but dedicated RAG document ingestion for this specific authority is scheduled for a subsequent phase.
            </p>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
            {approval.rag_answer || "No regulatory information generated."}
          </div>
        )}

        {/* Regulatory Disclaimer */}
        <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <strong>Official Notice:</strong> UdyamSetu AI provides AI-assisted guidance based on available regulatory sources. Requirements may vary by business type, location, scale and applicable regulations. Verify final requirements with the relevant government authority before submitting an application or making compliance decisions.
        </div>
      </div>

      {/* Grounded Source Documents */}
      {approval.sources && approval.sources.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                Retrieved Government Sources ({approval.sources.length})
              </h2>
              <p className="text-[11px] text-slate-400">Verifiable source metadata used for guidance</p>
            </div>
          </div>

          <div className="space-y-3">
            {approval.sources.map((src, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{src.document}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Authority: <strong>{src.authority || "Government Body"}</strong> {src.page ? `• Page ${src.page}` : ""} {src.year ? `• Year ${src.year}` : ""}
                    </p>
                  </div>

                  {src.source_url && (
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-orange hover:underline self-start sm:self-center"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {src.excerpt && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono leading-relaxed">
                    &ldquo;{src.excerpt}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Document Checklist for this Approval */}
      {documents.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900">Required Documents Checklist</h2>
              <p className="text-[11px] text-slate-400">Documents needed to complete this approval application</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    doc.status === "uploaded"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    {doc.status === "uploaded" ? "✓" : "○"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{doc.document_name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{doc.document_type} document</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    doc.status === "uploaded"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {doc.status}
                  </span>

                  {projectId && (
                    <button
                      onClick={() => setSelectedDocForUpload(doc)}
                      className="text-xs font-semibold text-brand-orange hover:bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition flex items-center space-x-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{doc.status === "uploaded" ? "Replace" : "Upload"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {selectedDocForUpload && projectId && (
        <DocumentUploadModal
          document={selectedDocForUpload}
          projectId={projectId}
          isOpen={true}
          onClose={() => setSelectedDocForUpload(null)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}

export default function ApprovalDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading approval details...</div>}>
      <ApprovalDetailContent />
    </Suspense>
  );
}
