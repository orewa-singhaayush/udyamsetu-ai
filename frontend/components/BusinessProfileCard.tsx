"use client";

import React from "react";
import { BusinessProfile } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { 
  Building, 
  MapPin, 
  IndianRupee, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Factory
} from "lucide-react";

interface Props {
  profile: BusinessProfile;
  className?: string;
}

export default function BusinessProfileCard({ profile, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Extracted Business Profile</h3>
            <p className="text-xs text-slate-500">Structured interpretation by AI Business Agent</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {profile.industry || "General"}
        </span>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Business Type */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Type</span>
          </div>
          <p className="font-bold text-sm text-slate-800 capitalize">
            {profile.business_type || "Unspecified"}
          </p>
        </div>

        {/* Business Subtype */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Subtype</span>
          </div>
          <p className="font-bold text-sm text-slate-800 capitalize">
            {profile.business_subtype || "Unspecified"}
          </p>
        </div>

        {/* Location */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Location</span>
          </div>
          <p className="font-bold text-sm text-slate-800">
            {profile.location || "Location not stated"}
          </p>
        </div>

        {/* Budget */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
            <span>Investment</span>
          </div>
          <p className="font-bold text-sm text-slate-800">
            {formatCurrency(profile.budget)}
          </p>
        </div>

        {/* Scale */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Scale</span>
          </div>
          <p className="font-bold text-sm text-slate-800 capitalize">
            {profile.scale || "Small"}
          </p>
        </div>

        {/* Industry */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Factory className="w-3.5 h-3.5 text-slate-400" />
            <span>Sector</span>
          </div>
          <p className="font-bold text-sm text-slate-800 capitalize">
            {profile.industry || "General"}
          </p>
        </div>
      </div>

      {/* Activities */}
      {profile.activities && profile.activities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Identified Business Activities
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.activities.map((act, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1 text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-lg border border-slate-200"
              >
                <CheckCircle2 className="w-3 h-3 text-brand-orange" />
                <span className="capitalize">{act}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Information Advisory */}
      {profile.missing_information && profile.missing_information.length > 0 && (
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Additional details recommended: </span>
            <span>
              Specifying {profile.missing_information.join(", ")} will allow more precise license applicability.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
