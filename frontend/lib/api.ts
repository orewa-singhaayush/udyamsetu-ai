import { AnalysisResult, Project, ProjectDocument, DocumentListResponse, Approval } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Automatically inject active user's identity header if available
  const authHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const savedUserStr = localStorage.getItem("udyamsetu_user");
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.id) {
          authHeaders["X-User-Id"] = savedUser.id;
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Accept": "application/json",
        ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...authHeaders,
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {
        // fallback to text
        const errText = await res.text();
        if (errText) errorMsg = errText;
      }
      throw new ApiError(errorMsg, res.status);
    }

    return await res.json() as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err.message || "Unable to connect to UdyamSetu AI service. Please make sure the backend is running.",
      0
    );
  }
}

export const api = {
  // Authentication
  login: async (email: string, password?: string): Promise<any> => {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (name: string, email: string, password?: string): Promise<any> => {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: name, email, password }),
    });
  },

  getMe: async (): Promise<any> => {
    return request("/api/auth/me");
  },

  // Health
  checkHealth: async () => {
    return request<{ status: string; service: string; model: string }>("/health");
  },

  // Business Analysis (Core AI)
  analyzeBusiness: async (businessDescription: string): Promise<AnalysisResult> => {
    return request<AnalysisResult>("/api/analyze-business", {
      method: "POST",
      body: JSON.stringify({ business_description: businessDescription }),
    });
  },

  // Projects (Scoped to authenticated user)
  getProjects: async (_userId?: string): Promise<{ projects: Project[] }> => {
    return request<{ projects: Project[] }>("/api/projects");
  },

  createProject: async (data: {
    name: string;
    description?: string;
    analysis_result?: AnalysisResult;
    user_id?: string;
  }): Promise<{ id: string; name: string; status: string }> => {
    return request<{ id: string; name: string; status: string }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProject: async (projectId: string): Promise<{
    project: Project;
    business_profile: any;
    approvals: Approval[];
    documents: ProjectDocument[];
    stats: any;
  }> => {
    return request(`/api/projects/${projectId}`);
  },

  deleteProject: async (projectId: string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  // Approvals
  getApprovals: async (projectId: string): Promise<{ approvals: Approval[] }> => {
    return request<{ approvals: Approval[] }>(`/api/projects/${projectId}/approvals`);
  },

  updateApprovalStatus: async (projectId: string, approvalId: string, status: string) => {
    return request(`/api/projects/${projectId}/approvals/${approvalId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Documents
  getDocuments: async (projectId: string): Promise<DocumentListResponse> => {
    return request<DocumentListResponse>(`/api/projects/${projectId}/documents`);
  },

  uploadDocument: async (
    projectId: string,
    documentId: string,
    file: File
  ): Promise<{ status: string; document_id: string; file_url: string; file_name: string }> => {
    const formData = new FormData();
    formData.append("document_id", documentId);
    formData.append("file", file);

    return request(`/api/projects/${projectId}/documents/upload`, {
      method: "POST",
      body: formData,
    });
  },

  // AI Assistant
  askAssistant: async (
    question: string,
    projectId?: string
  ): Promise<{ question: string; answer: string; domain: string; sources: any[] }> => {
    return request("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify({ question, project_id: projectId }),
    });
  },
};
