import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  CheckSquare, 
  Layers, 
  Search,
  Building2,
  Lock,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const steps = [
    {
      num: "01",
      title: "Business Idea",
      desc: "Describe what you want to start in your own words, location, and planned budget.",
      icon: Sparkles,
    },
    {
      num: "02",
      title: "AI Understanding",
      desc: "Supervisor agent extracts business type, sector, activities, and scale automatically.",
      icon: Layers,
    },
    {
      num: "03",
      title: "Approval Checklist",
      desc: "Identifies applicable licenses (FSSAI, GST, Udyam, Fire Safety, Pollution Control).",
      icon: CheckSquare,
    },
    {
      num: "04",
      title: "Document Center",
      desc: "Instant breakdown of exact documents required for each license with upload tracking.",
      icon: FileText,
    },
    {
      num: "05",
      title: "Compliance & Guidance",
      desc: "Source-grounded regulatory guidance powered by official gazettes and local RAG.",
      icon: ShieldCheck,
    },
  ];

  const highlights = [
    {
      title: "Zero Complicated Forms",
      desc: "No confusing bureaucratic jargon. Type naturally in Hindi or English (e.g., 'mujhe Pune me 20 lakh me paneer factory start karni hai').",
    },
    {
      title: "Source-Grounded AI",
      desc: "All regulatory guidance is strictly retrieved from official FSSAI, GST, MSME, and textile gazettes — never fabricated.",
    },
    {
      title: "Required Document Checklists",
      desc: "Know exactly which identity, constitution, premises, and technical documents are needed before submitting applications.",
    },
    {
      title: "Multi-Project Management",
      desc: "Plan and track compliance for multiple ventures independently without mixing documents or approvals.",
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 bg-orange-100/70 border border-orange-200 text-brand-orange text-xs font-bold px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>India’s First Conversational Business Compliance AI</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brand-slate tracking-tight leading-tight">
          Start Your Business Without the <span className="text-brand-orange">Approval Confusion.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          UdyamSetu AI empowers entrepreneurs to effortlessly discover applicable approvals, 
          manage required documents, and access source-grounded regulatory information.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-md transition"
          >
            <span>Analyze My Business</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition"
          >
            <span>Learn How It Works</span>
          </a>
        </div>

        {/* Demo prompt teaser */}
        <div className="pt-6">
          <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-4 max-w-xl mx-auto shadow-sm text-left flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">Example</span>
              <span className="text-xs sm:text-sm text-slate-700 font-medium truncate italic">
                &ldquo;mujhe pune me 20 lakh me paneer ki factory start krni h&rdquo;
              </span>
            </div>
            <Link
              href="/analyze?q=mujhe+pune+me+20+lakh+me+paneer+ki+factory+start+krni+h"
              className="text-xs font-bold text-brand-orange hover:underline whitespace-nowrap ml-3"
            >
              Try This →
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section id="how-it-works" className="max-w-6xl mx-auto space-y-8 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How UdyamSetu AI Works</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From a simple idea to a complete, audit-ready compliance roadmap in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded">
                    {s.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Value Propositions */}
      <section className="max-w-6xl mx-auto bg-brand-slate text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Designed for Indian Entrepreneurs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Transparent, source-grounded regulatory guidance to launch with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {highlights.map((h, i) => (
            <div key={i} className="p-5 bg-brand-slate-light/60 rounded-2xl border border-slate-600 space-y-2">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                <span>{h.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/analyze"
            className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition"
          >
            <span>Start Free Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Regulatory Disclaimer Banner */}
      <section className="max-w-4xl mx-auto p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 text-center leading-relaxed">
        <p className="font-semibold text-slate-700 mb-1">Official Regulatory Disclaimer</p>
        <p>
          UdyamSetu AI provides AI-assisted guidance based on available regulatory sources. 
          Requirements may vary by business type, location, scale, and applicable regulations. 
          Verify final requirements with the relevant government authority before submitting an application or making compliance decisions.
        </p>
      </section>
    </div>
  );
}
