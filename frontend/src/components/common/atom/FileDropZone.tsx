import { useState } from "react";
import { FileText, X } from "lucide-react";

export function FileDropzone({ field }: any) {
  const [isDragging, setIsDragging] = useState(false);

  const files: File[] = field.value || [];

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    field.onChange([...(files || []), ...newFiles]);
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
        className={`relative flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-10 text-center transition
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 bg-muted/30"
          }`}
      >
        <input
          type="file"
          multiple={field.multiple}
          disabled={field.disabled}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => addFiles(e.target.files)}
        />

        <p className="text-sm font-medium">
          Glissez et déposez des fichiers ici ou cliquez pour importer
        </p>
        <p className="text-xs text-muted-foreground mt-1">
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
              <div className="text-sm truncate max-w-[80%] flex items-center gap-2">
                <FileText className="w-6 h-5"></FileText>
                {file.name}
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
