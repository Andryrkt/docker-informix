import axiosInstance from "@/conf/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NavigationResult =
  | "VISITED"
  | "SEARCHED"
  | "ATTEMPTED"
  | "CANCELLED"
  | "ERROR_REDIRECT";

export type OperationType =
  | "SOUMISSION"
  | "VALIDATION"
  | "MODIFICATION"
  | "SUPPRESSION"
  | "CREATION"
  | "CLOTUR"
  | "FILE_MERGE"
  | "DB_SAV"
  | "DW_COP"
  | "FILE_UPLOAD"
  | "ANNULATION";

export type DocumentType =
  | "DIT"
  | "OR"
  | "FAC"
  | "RI"
  | "TIK"
  | "DA"
  | "DOM"
  | "BDM"
  | "CAS"
  | "CDE"
  | "DEV"
  | "BC"
  | "AC"
  | "CDEFRN"
  | "SW"
  | "MUT";

export interface NavigationPayload {
  pageUrl: string;
  pageTitle?: string;
  actionAttempted?: string;
  actionResult?: NavigationResult;
  searchData?: Record<string, unknown> | null;
  errorCode?: number | null;
  errorMessage?: string | null;
  sessionId?: string | null;
  refererUrl?: string | null;
}

export interface OperationPayload {
  operationType: OperationType;
  documentType?: DocumentType | null;
  documentId?: string | null;
  documentNumber?: string | null;
  isSuccess: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
  errorCode?: string | null;
  submittedData?: Record<string, unknown> | null;
  constraintsViolated?: Array<{ field: string; message: string }> | null;
  fileOperations?: Array<{
    type: string;
    fileName: string;
    path?: string;
    success: boolean;
    error?: string;
  }> | null;
  pageUrl?: string | null;
  durationMs?: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * POST fire-and-forget via fetch natif.
 * N'utilise PAS axiosInstance → échappe totalement à l'intercepteur d'auth.
 * Un 401 ou 500 est silencieusement ignoré : l'audit ne doit jamais bloquer l'UX.
 */
function auditFetch(path: string, body: unknown): void {
  const token     = localStorage.getItem("access_token");
  const companyId = localStorage.getItem("active_company_id");
  if (!token) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
  if (companyId) headers["X-Active-Company-ID"] = companyId;

  fetch(`${BASE_URL}${path}`, {
    method:    "POST",
    headers,
    body:      JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

// ── API calls — écriture (fire-and-forget) ────────────────────────────────────

/**
 * Enregistre un événement de navigation.
 * Utilise fetch natif pour éviter tout cycle d'authentification axios.
 */
export function postNavigationLog(payload: NavigationPayload): void {
  auditFetch("/audit/navigation", payload);
}

/**
 * Enregistre le résultat d'une opération métier.
 * Utilise fetch natif pour éviter tout cycle d'authentification axios.
 */
export function postOperationLog(payload: OperationPayload): void {
  auditFetch("/audit/operation", payload);
}

// ── Admin queries — lecture (via axiosInstance, avec auth normale) ─────────────

export async function fetchNavigationLogs(params?: {
  limit?: number;
  companyId?: number;
  userId?: number;
  errorsOnly?: boolean;
}) {
  const { data } = await axiosInstance.get("/audit/navigation", { params });
  return data;
}

export async function fetchOperationLogs(params?: {
  limit?: number;
  companyId?: number;
  operationType?: OperationType;
  documentType?: DocumentType;
  failuresOnly?: boolean;
}) {
  const { data } = await axiosInstance.get("/audit/operation", { params });
  return data;
}

export async function fetchDocumentHistory(
  documentType: DocumentType,
  documentId: string,
) {
  const { data } = await axiosInstance.get(
    `/audit/operation/document/${documentType}/${documentId}`,
  );
  return data;
}
