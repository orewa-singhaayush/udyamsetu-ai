"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  User, 
  Building2,
  Loader2 
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  domain?: string;
}

export default function AIAssistantPage() {
  const searchParams = useSearchParams();
  const { currentProject } = useAuth();
  const projectId = searchParams.get("projectId") || currentProject?.id;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: currentProject
        ? `Hello! I am your regulatory compliance assistant for **${currentProject.name}** (${currentProject.industry || "General"} sector). How can I assist you with approvals, licenses, or required documentation today?`
        : "Hello! I am UdyamSetu AI. Ask me any questions about Indian business approvals, FSSAI regulations, GST rules, Udyam MSME schemes, or textile initiatives.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQ = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userQ }]);
    setLoading(true);

    try {
      const res = await api.askAssistant(userQ, projectId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          sources: res.sources,
          domain: res.domain,
        },
      ]);
      setLoading(false);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Failed to reach AI assistant service. Please verify your backend.",
        },
      ]);
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What approval should I check first for my business?",
    "What is the turnover threshold for GST registration?",
    "What are the benefits of Udyam registration for an MSME?",
    "What are the mandatory hygiene requirements under FSSAI?",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Regulatory AI Assistant</h1>
            <p className="text-xs text-slate-500">
              {currentProject ? `Assisting: ${currentProject.name}` : "Grounded in official regulatory gazettes"}
            </p>
          </div>
        </div>

        {currentProject && (
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            {currentProject.industry || "General"} Context
          </span>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isUser ? "bg-slate-800 text-white" : "bg-brand-orange text-white"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                isUser
                  ? "bg-brand-slate text-white"
                  : "bg-slate-50 border border-slate-200/80 text-slate-800"
              }`}>
                <div className="whitespace-pre-line font-sans">
                  {m.content}
                </div>

                {/* Grounded Sources Metadata if returned */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/60 space-y-2">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Retrieved Official Sources ({m.sources.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((src: any, si: number) => (
                        <span
                          key={si}
                          className="inline-flex items-center space-x-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-600 px-2 py-0.5 rounded-lg"
                        >
                          <span>{src.document}</span>
                          {src.page && <span>(p. {src.page})</span>}
                          {src.source_url && (
                            <a
                              href={src.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-orange hover:underline ml-1"
                            >
                              <ExternalLink className="w-2.5 h-2.5 inline" />
                            </a>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl max-w-sm border border-slate-200">
            <Loader2 className="w-4 h-4 text-brand-orange animate-spin" />
            <span className="text-xs text-slate-500">Searching regulatory documents & consulting Gemma 3...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 flex-shrink-0">
        <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">Suggested:</span>
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => setInput(sq)}
            className="text-[11px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 whitespace-nowrap transition flex-shrink-0"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center space-x-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask a regulatory question (e.g. 'What documents are required for FSSAI?')..."
          className="flex-1 p-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-sm font-sans"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-2xl shadow-sm transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
