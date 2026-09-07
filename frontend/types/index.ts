export interface BusinessProfile {
  business_type: string;
  business_subtype: string | null;
  industry: string;
  location: string | null;
  budget: number | null;
  scale: string | null;
  activities: string[];
  missing_information: string[];
}

export interface ApprovalSource {
  document: string;
  page?: number | string | null;
  authority?: string | null;
  domain?: string | null;
  year?: number | null;
  source_url?: string | null;
  score?: number | null;
  excerpt?: string | null;
}

export interface Approval {
  id?: string;
  approval_name: string;
  authority: string;
  applicability: string;
  conditions: string[];
  status: string; // 'identified' | 'in_progress' | 'completed' | 'not_applicable' | 'review_required' | 'verify'
  rag_domain?: string | null;
  rag_query?: string | null;
  rag_answer?: string | null;
  sources: ApprovalSource[];
}

export interface AnalysisResult {
  business_description: string;
  business_profile: BusinessProfile;
  industry: string;
  business_type: string;
  location: string | null;
  approvals: Approval[];
}

export interface ProjectStats {
  total_approvals: number;
  completed_approvals: number;
  total_documents: number;
  uploaded_documents: number;
  document_progress_pct: number;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  business_type?: string;
  business_subtype?: string;
  industry?: string;
  location?: string;
  budget?: number;
  scale?: string;
  stats?: ProjectStats;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  required_document_id?: string | null;
  user_id: string;
  document_name: string;
  document_type: string;
  approval_name: string;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  status: "uploaded" | "missing" | "needs_review" | "not_applicable";
  verification_status: "pending" | "valid" | "invalid" | "needs_review";
  requirement_description?: string | null;
  is_required?: boolean | number;
  requirement_source_url?: string | null;
  uploaded_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  documents: ProjectDocument[];
  stats: {
    total: number;
    uploaded: number;
    missing: number;
    needs_review: number;
    progress_pct: number;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "entrepreneur" | "officer" | "admin";
}
