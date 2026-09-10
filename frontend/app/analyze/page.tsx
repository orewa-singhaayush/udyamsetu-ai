"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AnalysisResult } from "@/types";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import ApprovalCard from "@/components/ApprovalCard";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle2, 
  FolderPlus, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setCurrentProject } = useAuth();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [projectName, setProjectName] = useState("");

  const loadingMessages = [
    "Understanding your business idea...",
    "Extracting sector, activities, and scale...",
    "Identifying potentially applicable approvals...",
    "Searching domain-specific regulatory knowledge bases...",
    "Synthesizing source-grounded compliance answers...",
  ];

  // Auto-fill from query parameter if provided
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setInput(q);
    }
  }, [searchParams]);

  // Loading animation cycle
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 4000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.analyzeBusiness(input.trim());
      setResult(data);
      // Suggest project name based on extracted subtype and location
      const sub = data.business_profile.business_subtype || data.business_profile.business_type || "Business";
      const loc = data.business_profile.location || "Unit";
      const capitalSub = sub.charAt(0).toUpperCase() + sub.slice(1);
      setProjectName(`${capitalSub} Unit (${loc})`);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to complete business analysis. Please check your backend.");
    }
  };

  const handleSaveAsProject = async () => {
    if (!result || !projectName.trim()) return;
    if (!user) {
      alert("Please log in or create an account to save your business venture.");
      router.push("/login");
      return;
    }
    setSavingProject(true);

    try {
      const res = await api.createProject({
        name: projectName.trim(),
        description: input,
        analysis_result: result,
        user_id: user.id,
      });

      // Fetch newly created project to set in context
      const fullProj = await api.getProject(res.id);
      setCurrentProject(fullProj.project);

      setSavingProject(false);
      router.push(`/projects/${res.id}`);
    } catch (err: any) {
      setSavingProject(false);
      alert(err.message || "Failed to save project.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Page Title & Intro */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Natural Language Business Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Tell Us About Your Business
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Describe your business idea in simple everyday language. The AI will extract your profile and prepare a custom approval checklist.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Business Description
            </label>
            <textarea
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Example: mujhe Pune me 20 lakh me paneer ki factory start karni hai"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:bg-white transition resize-none font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Quick sample prompt buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Quick Try:</span>
              <button
                type="button"
                onClick={() => setInput("mujhe pune me 20 lakh me paneer ki factory start krni h")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
              >
                Dairy / Paneer Unit (Pune)
              </button>
              <button
                type="button"
                onClick={() => setInput("I want to start a small garment manufacturing unit in Amravati with a budget of 10 lakh")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
              >
                Garment Factory (Amravati)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Business</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Progress State */}
        {loading && (
          <div className="p-6 bg-orange-50/60 rounded-2xl border border-orange-200 text-center space-y-3 animate-in fade-in duration-200">
            <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-slate-900">
                {loadingMessages[loadingStep]}
              </p>
              <p className="text-xs text-slate-500">
                Evaluating regulatory knowledge base with Sentence Transformers & Gemma 3
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Analysis Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && !loading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Action Header: Save as Project */}
          <div className="bg-brand-slate text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Analysis Complete!</h2>
              <p className="text-xs text-slate-300">
                Save this analysis as an active project to track required documents and approval applications.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                placeholder="Project Name"
              />
              <button
                onClick={handleSaveAsProject}
                disabled={savingProject}
                className="inline-flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition flex-shrink-0"
              >
                {savingProject ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderPlus className="w-4 h-4" />
                )}
                <span>Save Project</span>
              </button>
            </div>
          </div>

          {/* Business Profile UI Card */}
          <BusinessProfileCard profile={result.business_profile} />

          {/* Approvals Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Potentially Applicable Approvals ({result.approvals.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Licenses and regulatory registrations mapped by UdyamSetu AI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.approvals.map((approval, i) => (
                <ApprovalCard
                  key={i}
                  approval={approval}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 text-center leading-relaxed">
            <p className="font-semibold text-slate-700 mb-0.5">Advisory AI Guidance</p>
            <p>
              UdyamSetu AI provides source-grounded regulatory information. Requirements may vary based on exact machinery, layout, and localized rules. Always consult the respective department before formal submission.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading analysis workspace...</div>}>
      <AnalyzeContent />
    </Suspense>
  );
}
