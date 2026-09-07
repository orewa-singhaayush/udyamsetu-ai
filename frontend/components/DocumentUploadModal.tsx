"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { ProjectDocument } from "@/types";
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from "lucide-react";

interface Props {
  document: ProjectDocument;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentUploadModal({
  document,
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !["pdf", "jpg", "jpeg", "png"].includes(ext || "")) {
      setError("Invalid file format. Only PDF, JPG, and PNG are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      await api.uploadDocument(projectId, document.id, selectedFile);
      setUploading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setUploading(false);
      setError(err.message || "Failed to upload document. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Document</h3>
            <p className="text-xs text-slate-500 truncate max-w-[280px]">
              {document.document_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Requirements Context */}
        {document.requirement_description && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Official Requirement: </span>
            <span>{document.requirement_description}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
            dragActive ? "border-brand-orange bg-orange-50/50" : "border-slate-200 hover:border-slate-300 bg-slate-50"
          }`}
          onClick={() => window.document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-orange border border-slate-100">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop file
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PDF, JPG, or PNG (up to 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <div className="flex items-center space-x-2 truncate">
              <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium truncate">{selectedFile.name}</span>
            </div>
            <span className="text-[11px] text-emerald-700 flex-shrink-0 ml-2">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 rounded-xl shadow-sm transition"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload Document</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
