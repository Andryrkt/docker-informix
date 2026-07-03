import { useState } from "react";
import { FileText, Download, FileWarning } from "lucide-react";
import { getFileUrl, formatFileSize } from "@/lib/utils"; // Assurez-vous d'avoir formatFileSize ici ou importé d'ailleurs

interface DocumentViewerProps {
  files: File[];
}

// Liste des types MIME que le navigateur sait afficher nativement
const PREVIEWABLE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "text/plain",
];

export function DocumentViewer({ files }: DocumentViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasFiles = files.length > 0;
  const primaryFile = hasFiles ? files[selectedIndex] : null;
  const activeFileUrl = primaryFile ? getFileUrl(primaryFile) : null;

  // Vérification de la capacité d'aperçu du navigateur
  const isPreviewable = primaryFile
    ? PREVIEWABLE_TYPES.includes(primaryFile.type) ||
      primaryFile.name.endsWith(".pdf")
    : false;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-sm text-white transition-all duration-200 rounded-xs border border-white/10 bg-black/40">
      {/* Header */}
      <div className="border-b border-white/10 bg-brand-dark/80 shrink-0">
        <div className="flex items-center justify-between px-4 py-2 font-semibold">
          <h2>
            {files.length <= 1
              ? "Prévisualisation du document"
              : "Prévisualisation des documents"}
          </h2>

          <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
            {files.length} document{files.length > 1 ? "s" : ""}
          </span>
        </div>

        {files.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-3 pb-2 scrollbar-none">
            {files.map((file, index) => (
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
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview Zone */}
      <div className="flex-1 min-h-0 bg-black/80 relative flex items-center justify-center">
        {hasFiles && activeFileUrl && primaryFile ? (
          isPreviewable ? (
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
            <div className="flex flex-col items-center  justify-center p-8 text-center space-y-4 max-w-md mx-auto animate-fade-in">
              <div className="p-4 bg-white/5 rounded-full border border-white/10 shadow-lg">
                <FileWarning className="h-8 w-8 text-amber-400" />
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-white truncate max-w-xs sm:max-w-sm">
                  {primaryFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  Ce format de fichier ne peut pas être prévisualisé directement
                  dans le navigateur.
                </p>
              </div>

              {/* L'attribut 'download' ici force la conservation exacte du nom de fichier d'origine */}
              <a
                href={activeFileUrl}
                download={primaryFile.name}
                className="inline-flex items-center gap-2 justify-center px-4 py-2.5 text-xs font-medium text-black bg-brand-primary hover:bg-brand-primary/90 rounded-xs shadow-md transition-colors"
              >
                <Download className="h-4 w-4" />
                Télécharger le document ({formatFileSize(primaryFile.size)})
              </a>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center lgmin-h-100 justify-center space-y-2 p-6 text-center opacity-40">
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
