import { useState } from "react";
import { File, FileText, FileUp, UploadCloud, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";

export function FileDropzone({ field }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  const files: File[] = Array.isArray(field.value)
    ? field.value
    : field.value
      ? [field.value]
      : [];

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

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    setErrors({});

    const newFiles = Array.from(fileList);

    const validFiles: File[] = [];
    const newErrors: Record<string, string> = {};

    for (const file of newFiles) {
      if (isInvalidName(file)) {
        newErrors[file.name] =
          `Nom invalide (format attendu : ${field.pattern})`;
        continue;
      }

      if (isTooLarge(file)) {
        newErrors[file.name] = `Le fichier dépasse ${field.maxSize} Mo`;
        continue;
      }

      validFiles.push(file);
    }

    setErrors(newErrors);

    if (field.multiple) {
      field.onChange(validFiles);
    } else {
      field.onChange(validFiles[0] ?? null);
    }
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    field.onChange(updated);
  };

  return (
    <div className="space-y-3 my-2">
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
          "relative flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-10 text-center  duration-150 transition-all",
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
          pattern={field.pattern}
          accept={field.accept}
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
          {field.maxSize && ` • Max ${field.maxSize} Mo`}
        </p>
      </div>

      {/* Errors list */}
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
