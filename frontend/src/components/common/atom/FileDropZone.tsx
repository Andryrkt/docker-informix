import { useState } from "react";
import { File, FileText, FileUp, UploadCloud, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

export function FileDropzone({ field }: any) {
  const [isDragging, setIsDragging] = useState(false);

  const files: File[] = Array.isArray(field.value)
    ? field.value
    : field.value
      ? [field.value]
      : [];

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    if (field.multiple) {
      field.onChange([...(files || []), ...newFiles]);
    } else {
      field.onChange(newFiles[0] ?? null);
    }
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    field.onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Dropzone */}
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
          "relative flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-10 text-center transition",
          isDragging
            ? "border-brand-primary"
            : "border-muted-foreground/30 bg-muted/30",
        )}
      >
        <input
          type="file"
          multiple={field.multiple}
          disabled={field.disabled}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => addFiles(e.target.files)}
        />
        <UploadCloud
          size={40}
          className={cn(
            "",
            isDragging ? "text-brand-primary" : "text-muted-foreground/60",
          )}
        ></UploadCloud>
        <p
          className={cn(
            "text-sm font-medium",
            isDragging ? "text-brand-primary" : "text-muted-foreground/60",
          )}
        >
          Glissez et déposez des fichiers ici ou cliquez pour importer
        </p>
        <p
          className={cn(
            "text-xs mt-1",
            isDragging ? "text-brand-primary" : "text-muted-foreground/60",
          )}
        >
          {field.multiple
            ? "Plusieurs fichiers acceptés"
            : "Un seul fichier uniquement"}
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between  px-3 py-2 bg-background"
            >
              <div className="flex items-center gap-2 max-w-[80%]">
                <FileText className="w-5 h-5 shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Taille : {formatFileSize(file.size)}
                  </p>
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
          ))}
        </div>
      )}
    </div>
  );
}
