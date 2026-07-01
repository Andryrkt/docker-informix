import { useLocation } from "react-router";
import {
  postOperationLog,
  type DocumentType,
  type OperationPayload,
  type OperationType,
} from "@/domains/audit/api/auditApi";

/**
 * Paramètres pour un log d'opération.
 * `operationType` et `isSuccess` sont obligatoires ; le reste est contextuel.
 */
export interface LogOperationParams {
  operationType: OperationType;
  documentType?: DocumentType;
  documentId?: string | number;
  documentNumber?: string;
  isSuccess: boolean;
  successMessage?: string;
  errorMessage?: string;
  errorCode?: string;
  submittedData?: Record<string, unknown>;
  constraintsViolated?: Array<{ field: string; message: string }>;
  fileOperations?: OperationPayload["fileOperations"];
  durationMs?: number;
}

/**
 * Hook pour logger les opérations métier depuis n'importe quel composant.
 *
 * @returns `logOperation` — fonction fire-and-forget, ne lance jamais d'exception.
 *
 * @example
 * const { logOperation } = useAuditOperation();
 *
 * // Soumission réussie d'un DIT
 * await submitDit(data);
 * logOperation({
 *   operationType: "SOUMISSION",
 *   documentType: "DIT",
 *   documentNumber: "DIT-2025-0001",
 *   isSuccess: true,
 *   successMessage: "DIT créé avec succès",
 *   submittedData: data,
 * });
 *
 * // Suppression annulée (l'utilisateur a cliqué Annuler dans la modale)
 * logOperation({ operationType: "ANNULATION", documentType: "OR", isSuccess: true });
 *
 * // Contrainte métier non respectée
 * logOperation({
 *   operationType: "SOUMISSION",
 *   documentType: "OR",
 *   isSuccess: false,
 *   errorCode: "MISSING_OR_NUMBER",
 *   constraintsViolated: [{ field: "numeroOR", message: "Le numéro OR est obligatoire" }],
 * });
 */
export function useAuditOperation() {
  const location = useLocation();

  const logOperation = (params: LogOperationParams): void => {
    const payload: OperationPayload = {
      operationType:       params.operationType,
      documentType:        params.documentType    ?? null,
      documentId:          params.documentId != null ? String(params.documentId) : null,
      documentNumber:      params.documentNumber  ?? null,
      isSuccess:           params.isSuccess,
      successMessage:      params.successMessage  ?? null,
      errorMessage:        params.errorMessage    ?? null,
      errorCode:           params.errorCode       ?? null,
      submittedData:       params.submittedData   ?? null,
      constraintsViolated: params.constraintsViolated ?? null,
      fileOperations:      params.fileOperations  ?? null,
      pageUrl:             location.pathname,
      durationMs:          params.durationMs      ?? null,
    };

    // Fire-and-forget
    postOperationLog(payload);
  };

  return { logOperation };
}

// ── Helpers autonomes (utilisables hors composant React) ─────────────────────

/**
 * Log d'une opération sans avoir besoin du contexte React (ex: dans axios interceptor).
 * Capture automatiquement l'URL courante via window.location.
 */
export function logOperationStandalone(params: LogOperationParams): void {
  const payload: OperationPayload = {
    operationType:       params.operationType,
    documentType:        params.documentType    ?? null,
    documentId:          params.documentId != null ? String(params.documentId) : null,
    documentNumber:      params.documentNumber  ?? null,
    isSuccess:           params.isSuccess,
    successMessage:      params.successMessage  ?? null,
    errorMessage:        params.errorMessage    ?? null,
    errorCode:           params.errorCode       ?? null,
    submittedData:       params.submittedData   ?? null,
    constraintsViolated: params.constraintsViolated ?? null,
    fileOperations:      params.fileOperations  ?? null,
    pageUrl:             window.location.pathname,
    durationMs:          params.durationMs      ?? null,
  };

  postOperationLog(payload);
}
