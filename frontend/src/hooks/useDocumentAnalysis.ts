/**
 * ============================================================================
 * hooks/use-document-analysis.ts
 * ----------------------------------------------------------------------------
 * Hook React réutilisable qui pilote le pipeline de lib/document-analysis.ts
 * pour un ensemble de fichiers : lance l'analyse, suit la progression,
 * permet l'annulation, et expose le résultat par fichier.
 *
 * Indépendant de tout composant de dropzone précis : peut être branché sur
 * n'importe quel champ de formulaire qui manipule un tableau de File[].
 * ============================================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzeDocument,
  isAcceptedFile,
  PipelineError,
  type AnalysisResult,
  type PipelineOptions,
} from "../lib/document-analysis";

export type FileAnalysisStatus =
  | "idle"
  | "validating"
  | "processing"
  | "done"
  | "error"
  | "cancelled";

export interface FileAnalysisState {
  status: FileAnalysisStatus;
  progress: number;
  progressLabel: string;
  result: AnalysisResult | null;
  errorMessage: string | null;
}

const IDLE_STATE: FileAnalysisState = {
  status: "idle",
  progress: 0,
  progressLabel: "",
  result: null,
  errorMessage: null,
};

/** Clé stable identifiant un File tant qu'il n'est pas remplacé/relu. */
export function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export interface UseDocumentAnalysisResult {
  /** État d'analyse courant d'un fichier donné (idle si jamais lancé). */
  getState: (file: File) => FileAnalysisState;
  /** Lance (ou relance) l'analyse d'un fichier. Idempotent si déjà en cours. */
  analyze: (file: File) => void;
  /** Annule l'analyse en cours d'un fichier, si applicable. */
  cancel: (file: File) => void;
  /** Retire l'état associé à un fichier (à faire lors de son retrait du champ). */
  forget: (file: File) => void;
  /** Vrai si au moins un fichier est en cours de validation/traitement. */
  isAnyProcessing: boolean;
}

/**
 * @param options Options du pipeline (mot recherché, seuils, etc.), voir
 *   DEFAULT_PIPELINE_OPTIONS dans lib/document-analysis.ts pour les valeurs
 *   par défaut. Peut être omis pour utiliser la configuration standard.
 * @param autoAnalyze Si vrai (défaut), toute analyse doit être déclenchée
 *   explicitement via `analyze()`. Le composant FileDropzone s'en charge
 *   automatiquement à l'ajout d'un fichier.
 */
export function useDocumentAnalysis(
  options?: Partial<PipelineOptions>,
): UseDocumentAnalysisResult {
  const [states, setStates] = useState<Record<string, FileAnalysisState>>({});
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Nettoyage global : annule tout traitement en cours au démontage.
  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      controllers.forEach((c) => c.abort());
      controllers.clear();
    };
  }, []);

  const setFileState = useCallback(
    (key: string, patch: Partial<FileAnalysisState>) => {
      setStates((prev) => ({
        ...prev,
        [key]: { ...(prev[key] ?? IDLE_STATE), ...patch },
      }));
    },
    [],
  );

  const analyze = useCallback(
    (file: File) => {
      const key = fileKey(file);
      if (controllersRef.current.has(key)) return; // déjà en cours

      if (!isAcceptedFile(file)) {
        setFileState(key, {
          status: "error",
          errorMessage:
            "Type de fichier non supporté (JPG, PNG ou PDF attendu).",
        });
        return;
      }

      const controller = new AbortController();
      controllersRef.current.set(key, controller);
      setFileState(key, {
        status: "validating",
        progress: 0,
        progressLabel: "En attente…",
        errorMessage: null,
      });

      analyzeDocument(file, optionsRef.current ?? {}, {
        signal: controller.signal,
        onProgress: (progress, label) => {
          setFileState(key, {
            status: "processing",
            progress: Math.round(progress),
            progressLabel: label,
          });
        },
      })
        .then((result) => {
          setFileState(key, {
            status: "done",
            progress: 100,
            progressLabel: "Terminé",
            result,
          });
        })
        .catch((err: unknown) => {
          if (err instanceof PipelineError && err.code === "CANCELLED") {
            setFileState(key, { status: "cancelled", progressLabel: "Annulé" });
            return;
          }
          const message =
            err instanceof Error
              ? err.message
              : "Erreur inconnue pendant l'analyse.";
          setFileState(key, { status: "error", errorMessage: message });
        })
        .finally(() => {
          controllersRef.current.delete(key);
        });
    },
    [setFileState],
  );

  const cancel = useCallback((file: File) => {
    controllersRef.current.get(fileKey(file))?.abort();
  }, []);

  const forget = useCallback((file: File) => {
    const key = fileKey(file);
    controllersRef.current.get(key)?.abort();
    controllersRef.current.delete(key);
    setStates((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const getState = useCallback(
    (file: File): FileAnalysisState => states[fileKey(file)] ?? IDLE_STATE,
    [states],
  );

  const isAnyProcessing = Object.values(states).some(
    (s) => s.status === "validating" || s.status === "processing",
  );

  return { getState, analyze, cancel, forget, isAnyProcessing };
}
