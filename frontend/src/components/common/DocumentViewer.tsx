import { useState } from "react";
import { FileText } from "lucide-react";
import { getFileUrl } from "@/lib/utils";

interface DocumentViewerProps {
  files: File[];
}

export function DocumentViewer({ files }: DocumentViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasFiles = files.length > 0;
  const primaryFile = hasFiles ? files[selectedIndex] : null;
  const activeFileUrl = primaryFile ? getFileUrl(primaryFile) : null;

  return (
    <div className="overflow-hidden text-sm text-white transition-all duration-200 rounded-xs border">
      {/* Header */}
      <div className="border-b bg-brand-dark/80">
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
          <div className="flex gap-2 overflow-x-auto px-3 pb-2">
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

      {/* Preview */}
      <div className="grid min-h-140 divide-y divide-gray-800 md:divide-x md:divide-y-0">
        <div className="relative flex items-center justify-center bg-black/80 md:col-span-2">
          {hasFiles && activeFileUrl && primaryFile ? (
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
            <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center opacity-30">
              <p className="text-xs font-medium">Aucun document sélectionné</p>
              <p className="text-[11px]">
                Ajoutez une pièce jointe pour voir un aperçu en temps réel
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
