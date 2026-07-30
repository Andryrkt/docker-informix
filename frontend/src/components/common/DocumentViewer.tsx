import { useState } from "react";
import {
  FileText,
  Download,
  FileWarning,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { getFileUrl, formatFileSize, cn } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/document-analysis";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentViewerProps {
  files: File[];
  analysisResults?: Map<string, AnalysisResult>;
  title?: string;
}

const PREVIEWABLE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "text/plain",
];

export function DocumentViewer({
  files,
  analysisResults,
  title,
}: DocumentViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasFiles = files.length > 0;
  const primaryFile = hasFiles ? files[selectedIndex] : null;
  const activeFileUrl = primaryFile ? getFileUrl(primaryFile) : null;

  const getAnalysis = (file: File): AnalysisResult | null => {
    if (!analysisResults) return null;
    const key = `${file.name}_${file.size}_${file.lastModified}`;
    return analysisResults.get(key) || null;
  };

  const currentAnalysis = primaryFile ? getAnalysis(primaryFile) : null;

  const isPreviewable = primaryFile
    ? PREVIEWABLE_TYPES.includes(primaryFile.type) ||
      primaryFile.name.endsWith(".pdf")
    : false;

  const statusColor = (status?: string) => {
    switch (status) {
      case "OK":
        return "text-green-500";
      case "WARNING":
        return "text-yellow-500";
      case "SUSPICIOUS":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const statusIcon = (status?: string) => {
    switch (status) {
      case "OK":
        return <CheckCircle className="h-4 w-4" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4" />;
      case "SUSPICIOUS":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const statusBadge = (analysis: AnalysisResult | null) => {
    if (!analysis) return null;
    return (
      <span
        className={cn("flex items-center gap-1", statusColor(analysis.status))}
      >
        {statusIcon(analysis.status)}
        <span>{analysis.fraudScore}%</span>
      </span>
    );
  };
  const defaultTitle =
    files.length <= 1
      ? "Prévisualisation du document"
      : "Prévisualisation des documents";
  return (
    <div className="flex flex-col min-h-150 w-full overflow-hidden text-sm text-white transition-all duration-200 rounded-xs border border-white/10 bg-black/40 ">
      {/* Header */}
      <div className="border-b border-white/10 bg-brand-dark/80 shrink-0">
        <div className="flex items-center justify-between px-4 py-2 font-semibold">
          <h2>
            <h2>{title ?? defaultTitle}</h2>
          </h2>
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
            {files.length} document{files.length > 1 ? "s" : ""}
          </span>
        </div>
        {files.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-3 pb-2 ">
            {files.map((file, index) => {
              const analysis = getAnalysis(file);
              return (
                <button
                  key={`${file.name}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition
                    ${
                      selectedIndex === index
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="max-w-44 truncate">{file.name}</span>
                  {analysis && statusBadge(analysis)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Zone */}
      <div className="flex-1 min-h-0 bg-black/80 relative flex flex-col">
        {hasFiles && activeFileUrl && primaryFile ? (
          <>
            {/* ===== NOUVEAU : DropdownMenu shadcn ===== */}
            {currentAnalysis && (
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-black/80 backdrop-blur-sm hover:bg-white/10 border border-white/10 text-xs h-auto py-1.5 px-3 gap-2"
                    >
                      <span
                        className={cn(
                          "font-medium flex items-center gap-1",
                          statusColor(currentAnalysis.status),
                        )}
                      >
                        {statusIcon(currentAnalysis.status)}
                        Score {currentAnalysis.fraudScore}% –{" "}
                        {currentAnalysis.status}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-black/90 backdrop-blur-sm border border-white/10 text-white w-72 p-0 shadow-lg"
                  >
                    <Card className="bg-transparent border-0 text-white w-full">
                      <CardContent className="p-3 space-y-2">
                        {/* Warnings */}
                        {/* {currentAnalysis.warnings.length > 0 && (
                          <div>
                           <div className="text-yellow-400 font-medium mb-1 flex items-center gap-1">
                              <span>⚠️</span> Avertissements
                            </div>
                            <ul className="list-disc list-inside text-gray-300 space-y-0.5 text-xs">
                              {currentAnalysis.warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )} */}

                        {/* Breakdown des pénalités */}
                        {currentAnalysis.scoreBreakdown.length > 0 && (
                          <>
                            <div className="text-yellow-400 font-medium mb-1 flex items-center gap-1">
                              <span>⚠️</span> Avertissements
                            </div>
                            <div>
                              <div className="text-gray-400 font-medium mb-1">
                                Pénalités appliquées
                              </div>
                              <ul className="space-y-0.5 text-xs">
                                {currentAnalysis.scoreBreakdown.map(
                                  (item, i) => (
                                    <li
                                      key={i}
                                      className="flex justify-between items-center border-b border-white/5 pb-0.5"
                                    >
                                      <span className="text-gray-300">
                                        {item.label}
                                      </span>
                                      <span className="text-red-400 font-medium">
                                        -{item.penalty} pts
                                      </span>
                                    </li>
                                  ),
                                )}
                              </ul>
                              <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/10 font-semibold">
                                <span>Score final</span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    statusColor(currentAnalysis.status),
                                  )}
                                >
                                  {currentAnalysis.fraudScore}%
                                </span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Informations supplémentaires */}
                        <div className="grid grid-cols-2 gap-1 text-gray-400 pt-1 border-t border-white/10 text-xs">
                          <span>Confiance OCR</span>
                          <span className="text-right">
                            {currentAnalysis.averageOCRConfidence.toFixed(0)}%
                          </span>
                          <span>Occurrences</span>
                          <span className="text-right">
                            {currentAnalysis.occurrences}
                          </span>
                          <span>Pages traitées</span>
                          <span className="text-right">
                            {currentAnalysis.pages}
                          </span>
                          <span>Qualité image</span>
                          <span className="text-right">
                            {currentAnalysis.imageQuality.toFixed(0)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Aperçu */}
            <div className="flex-1 min-h-0 relative">
              {isPreviewable ? (
                <object
                  data={activeFileUrl}
                  type={primaryFile.type}
                  className="h-full w-full animate-fade-in"
                >
                  <iframe
                    src={activeFileUrl}
                    className="h-full w-full border-none"
                    title={primaryFile.name}
                  />
                </object>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md mx-auto h-full animate-fade-in">
                  <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-lg">
                    <FileWarning className="h-8 w-8 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-white truncate max-w-xs sm:max-w-sm">
                      {primaryFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Ce format de fichier ne peut pas être prévisualisé
                      directement dans le navigateur.
                    </p>
                  </div>
                  <a
                    href={activeFileUrl}
                    download={primaryFile.name}
                    className="inline-flex items-center gap-2 justify-center px-4 py-2.5 text-xs font-medium text-black bg-brand-primary hover:bg-brand-primary/90 rounded-xs shadow-md transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le document ({formatFileSize(primaryFile.size)})
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 p-6 text-center opacity-40">
            <p className="text-xs font-medium">Aucun document sélectionné</p>
            <p className="text-[11px] text-gray-400">
              Sélectionnez une pièce jointe pour charger l'aperçu ou le module
              de téléchargement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
