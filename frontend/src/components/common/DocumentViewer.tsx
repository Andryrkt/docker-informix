import { getFileUrl } from "@/lib/utils";
import { FileText, UploadCloud } from "lucide-react";

interface DocumentViewerProps {
  files: File[];
}

export function DocumentViewer({ files }: DocumentViewerProps) {
  const hasFiles = files && files.length > 0;
  const primaryFile = hasFiles ? files[0] : null;
  const activeFileUrl = primaryFile ? getFileUrl(primaryFile) : null;
  const fileCount = files?.length || 0;

  return (
    <div className="overflow-hidden  text-sm text-white  transition-all duration-200">
      {/* Header Summary */}
      <div className="bg-brand-dark/40 px-4 py-2 border-b font-semibold flex justify-between items-center">
        <span>Prévisualisation des pièces jointes</span>
        <span className="text-xs font-mono  px-2 py-0.5  ">
          {fileCount} document{fileCount > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid divide-y md:divide-y-0 md:divide-x divide-gray-800 h-130">
        {/* Sandbox Embed Canvas Window */}
        <div className="md:col-span-2 bg-black/80 flex items-center justify-center relative">
          {hasFiles && activeFileUrl && primaryFile ? (
            <>
              <object
                data={activeFileUrl}
                type={primaryFile.type}
                className="w-full h-full animate-fade-in"
              >
                <iframe
                  src={activeFileUrl}
                  className="w-full h-full border-none"
                  title="Aperçu du document"
                />
              </object>
            </>
          ) : (
            /* Centered Placeholder Frame */
            <div className="flex flex-col items-center justify-center space-y-2 text-center p-6 opacity-30 select-none">
              <div className="space-y-1">
                <p className="text-xs font-medium ">
                  Aucun document sélectionné
                </p>
                <p className="text-[11px]">
                  Ajoutez une pièce jointe pour voir un aperçu en temps réel
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
