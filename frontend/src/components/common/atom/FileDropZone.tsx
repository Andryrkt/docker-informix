import { useState, useRef, useEffect } from "react";
import {
  FileText,
  ScanText,
  UploadCloud,
  X,
  Loader2,
  XCircle,
  LoaderCircle,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  analyzeDocument,
  terminateOcrWorker,
  PipelineError,
  type AnalysisResult,
  type PipelineOptions,
} from "@/lib/document-analysis";

export function FileDropzone({ field }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<
    Map<string, AnalysisResult>
  >(new Map());
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      terminateOcrWorker().catch(console.warn);
    };
  }, []);

  const files: File[] = Array.isArray(field.value)
    ? field.value
    : field.value
      ? [field.value]
      : [];

  // ---------- Clé unique ----------
  const getFileKey = (file: File) =>
    `${file.name}_${file.size}_${file.lastModified}`;

  // ---------- Helpers ----------
  const getRegex = () => {
    if (!field.pattern) return null;
    try {
      return new RegExp(field.pattern);
    } catch (e) {
      console.warn("Invalid regex pattern:", field.pattern);
      return null;
    }
  };
  const regex = getRegex();

  const isInvalidName = (file: File) => {
    if (!regex) return false;
    return !regex.test(file.name);
  };
  const isTooLarge = (file: File) => {
    if (!field.maxSize) return false;
    return file.size > field.maxSize * 1024 * 1024;
  };
  const isDuplicate = (file: File, list: File[]) => {
    return list.some(
      (f) =>
        f.name === file.name &&
        f.size === file.size &&
        f.lastModified === file.lastModified,
    );
  };

  // ---------- Options OCR ----------
  const getOcrOptions = (): Partial<PipelineOptions> | null => {
    if (!field.ocrValidation) return null;
    if (typeof field.ocrValidation === "string") {
      return { targetWords: [field.ocrValidation] };
    }
    if (Array.isArray(field.ocrValidation)) {
      return { targetWords: field.ocrValidation };
    }
    if (typeof field.ocrValidation === "object") {
      const obj = field.ocrValidation as any;
      if (obj.targetWords) return obj;
      if (obj.targetWord) {
        const { targetWord, ...rest } = obj;
        return { ...rest, targetWords: [targetWord] };
      }
      return obj;
    }
    return null;
  };

  // ---------- Annulation ----------
  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    setProgress(0);
    setProgressLabel("");
    toast.info("Analyse annulée par l'utilisateur");
  };

  // ---------- Fonction addFiles (refondue) ----------
  const addFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    if (isProcessing) return;

    setErrors({});
    setProgress(0);
    setProgressLabel("");

    const newFiles = Array.from(fileList);
    const maxFiles = field.maxFiles;
    const existingFiles = Array.isArray(field.value)
      ? field.value
      : field.value
        ? [field.value]
        : [];

    // 1. Validations de base
    const validFiles: File[] = [];
    const basicErrors: Record<string, string> = {};

    for (const file of newFiles) {
      if (isDuplicate(file, existingFiles)) {
        basicErrors[file.name] = "Ce fichier est déjà ajouté";
        continue;
      }
      if (isInvalidName(file)) {
        basicErrors[file.name] =
          `Nom invalide (format attendu : ${field.pattern})`;
        continue;
      }
      if (isTooLarge(file)) {
        basicErrors[file.name] = `Le fichier dépasse ${field.maxSize} Mo`;
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setErrors(basicErrors);
      return;
    }

    const ocrOptions = getOcrOptions();
    const shouldRunOCR = !!ocrOptions;

    let allErrors = { ...basicErrors };

    if (shouldRunOCR) {
      setIsProcessing(true);
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setTotalFiles(validFiles.length);
      setCurrentFileIndex(0);

      const acceptedFiles: File[] = [];
      const newAnalysisResults = new Map(analysisResults);
      const failedFiles: { file: File; error: any }[] = [];

      try {
        // Traitement séquentiel pour afficher la progression
        for (let i = 0; i < validFiles.length; i++) {
          if (controller.signal.aborted) break;

          const file = validFiles[i];
          setCurrentFileIndex(i + 1);
          setProgress((i / validFiles.length) * 100);

          try {
            const result = await analyzeDocument(file, ocrOptions, {
              onProgress: (progress, label) => {
                // Progression globale : 50% pour le fichier en cours, le reste pour les suivants
                const baseProgress = (i / validFiles.length) * 100;
                const fileProgress =
                  (progress / 100) * (1 / validFiles.length) * 100;
                setProgress(baseProgress + fileProgress);
                setProgressLabel(`(${i + 1}/${validFiles.length}) ${label}`);
              },
              signal: controller.signal,
            });

            newAnalysisResults.set(getFileKey(file), result);
            if (result.status !== "SUSPICIOUS") {
              acceptedFiles.push(file);
            } else {
              const warnings =
                result.warnings.length > 0
                  ? result.warnings.join(", ")
                  : `Score de fraude ${result.fraudScore}% (seuil non atteint)`;
              allErrors[file.name] = `Document suspect : ${warnings}`;
            }
          } catch (error) {
            if (controller.signal.aborted) {
              // Annulation, on sort
              break;
            }
            let msg = "Erreur technique lors de l'analyse";
            if (error instanceof PipelineError) {
              msg = error.message;
            } else if (error instanceof Error) {
              msg = error.message;
            }
            allErrors[file.name] = msg;
            failedFiles.push({ file, error });
            console.error("Erreur analyse", file.name, error);
          }
        }

        // Si annulation, on nettoie
        if (controller.signal.aborted) {
          // On ne met pas à jour les fichiers
          setProgress(0);
          setProgressLabel("");
          setIsProcessing(false);
          abortControllerRef.current = null;
          return;
        }

        // Appliquer la limite maxFiles
        let merged = [...existingFiles, ...acceptedFiles];
        if (field.multiple && maxFiles && merged.length > maxFiles) {
          allErrors.maxFiles = `Vous ne pouvez pas dépasser ${maxFiles} fichiers`;
          toast.error(`Maximum ${maxFiles} fichiers autorisés`);
          merged = merged.slice(0, maxFiles);
        }

        setErrors(allErrors);
        setAnalysisResults(newAnalysisResults);
        if (field.onResults) {
          field.onResults(newAnalysisResults);
        }

        if (field.multiple) {
          field.onChange(merged);
        } else {
          field.onChange(acceptedFiles.slice(0, 1));
        }

        setProgress(100);
        setProgressLabel("Terminé");
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          // Annulation volontaire, on ignore
        } else {
          console.error("Erreur inattendue lors de l'analyse:", error);
          toast.error("Une erreur est survenue lors de l'analyse des fichiers");
        }
      } finally {
        setIsProcessing(false);
        abortControllerRef.current = null;
        // Remettre la progression à 0 après un court délai
        setTimeout(() => {
          setProgress(0);
          setProgressLabel("");
        }, 1000);
      }
    } else {
      // Pas d'OCR → comportement original
      let merged = [...existingFiles, ...validFiles];
      if (field.multiple && maxFiles && merged.length > maxFiles) {
        allErrors.maxFiles = `Vous ne pouvez pas dépasser ${maxFiles} fichiers`;
        toast.error(`Maximum ${maxFiles} fichiers autorisés`);
        merged = merged.slice(0, maxFiles);
      }
      setErrors(allErrors);
      if (field.multiple) {
        field.onChange(merged);
      } else {
        field.onChange(validFiles.slice(0, 1));
      }
    }
  };

  // ---------- removeFile ----------
  const removeFile = (index: number) => {
    const current = Array.isArray(field.value)
      ? field.value
      : field.value
        ? [field.value]
        : [];
    const removedFile = current[index];
    const updated = current.filter((_, i) => i !== index);
    field.onChange(updated);

    if (removedFile) {
      const key = getFileKey(removedFile);
      setAnalysisResults((prev) => {
        const next = new Map(prev);
        next.delete(key);
        if (field.onResults) {
          field.onResults(next);
        }
        return next;
      });
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[removedFile.name];
        delete copy.maxFiles;
        return copy;
      });
    }
  };

  // ---------- Rendu ----------
  return (
    <div
      className={cn(
        "space-y-3 my-2 z-50 cursor-pointer",
        isProcessing && "cursor-wait",
      )}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-10 text-center duration-150 transition-all hover:border-brand-primary",
          isDragging || isProcessing
            ? "border-brand-primary"
            : "border-muted-foreground/30 bg-muted/30",
          isProcessing && "cursor-wait z-60",
        )}
      >
        <input
          type="file"
          multiple={field.multiple}
          disabled={field.disabled || isProcessing}
          className="absolute inset-0 opacity-0 z-40"
          onChange={(e) => addFiles(e.target.files)}
          pattern={field.pattern}
          accept={field.accept}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-3 w-full z-50">
            <LoaderCircle
              size={40}
              className="text-brand-primary animate-spin"
            />
            <p className="text-sm font-medium text-muted-foreground">
              {progressLabel || "Analyse en cours..."}
            </p>
            {/* Barre de progression */}
            <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {Math.round(Math.min(progress, 100))}%
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                <XCircle size={20} />
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud
              size={40}
              className={cn(
                "text-muted-foreground/60",
                isDragging && "text-brand-primary",
              )}
            />
            <p
              className={cn(
                "text-sm font-medium text-muted-foreground/60",
                isDragging && "text-brand-primary",
              )}
            >
              Glissez et déposez des fichiers ici ou cliquez pour importer
            </p>
            <p
              className={cn(
                "text-xs mt-1 text-muted-foreground/60",
                isDragging && "text-brand-primary",
              )}
            >
              {field.maxFiles && `Nombre max ${field.maxFiles} fichiers`}
              {field.maxSize && ` • Taille max ${field.maxSize} Mo`}
              {field.ocrValidation && ` • Analyse OCR active`}
            </p>
            <Button type="button" variant="brand" className="mt-3 text-white">
              {field.multiple
                ? "Plusieurs fichiers acceptés"
                : "Un seul fichier uniquement"}
            </Button>
          </>
        )}
      </div>

      {/* Liste des erreurs */}
      {Object.keys(errors).length > 0 && (
        <div className="space-y-1.5 w-full text-left">
          {Object.entries(errors).map(([fileName, errorMsg]) => (
            <div
              key={fileName}
              className="flex flex-wrap items-center gap-x-1 text-xs text-red-500 min-w-0 w-full"
            >
              <span
                className="font-semibold truncate max-w-[200px]"
                title={fileName}
              >
                {fileName}
              </span>
              <span>:</span>
              <span className="wrap-break-word">{errorMsg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const key = getFileKey(file);
            const result = analysisResults.get(key);
            return (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 bg-background"
              >
                <div className="flex items-center gap-2 max-w-[80%]">
                  <FileText className="w-5 h-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Taille : {formatFileSize(file.size)}</span>
                      {result && (
                        <>
                          <span>•</span>
                          <span
                            className={cn(
                              "font-medium",
                              result.status === "OK" && "text-green-600",
                              result.status === "WARNING" && "text-yellow-600",
                              result.status === "SUSPICIOUS" && "text-red-600",
                            )}
                          >
                            Score {result.fraudScore}%
                          </span>
                          <span>•</span>
                          <span className="capitalize">
                            {result.status.toLowerCase()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
