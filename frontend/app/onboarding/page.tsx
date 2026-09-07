"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Building2, CheckCircle2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Welcome to UdyamSetu AI!</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Let’s set up your first venture. You do not need to fill long compliance forms. Simply describe your idea in natural language.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900">What happens next:</h3>
        <ul className="space-y-3 text-xs text-slate-600">
          <li className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>AI analyzes your business category, planned location, and scale.</span>
          </li>
          <li className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Maps applicable licenses like FSSAI, GST, Udyam, Fire Safety, and Pollution NOC.</span>
          </li>
          <li className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Generates an actionable required document checklist with upload tracking.</span>
          </li>
        </ul>
      </div>

      <div>
        <Link
          href="/analyze"
          className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition"
        >
          <span>Describe Your First Business</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
