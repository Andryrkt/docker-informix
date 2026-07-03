import { useState } from "react";
import { File, FileText, FileUp, UploadCloud, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const isDuplicate = (file: File, list: File[]) => {
    return list.some(
      (f) =>
        f.name === file.name &&
        f.size === file.size &&
        f.lastModified === file.lastModified,
    );
  };
  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    setErrors({});

    const newFiles = Array.from(fileList);

    const validFiles: File[] = [];
    const newErrors: Record<string, string> = {};

    const maxFiles = field.maxFiles;

    const existingFiles = Array.isArray(field.value)
      ? field.value
      : field.value
        ? [field.value]
        : [];

    // 🔥 anti doublon + validation
    for (const file of newFiles) {
      if (isDuplicate(file, existingFiles)) {
        newErrors[file.name] = "Ce fichier est déjà ajouté";
        continue;
      }

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

    let merged = [...existingFiles, ...validFiles];

    // 🔥 MAX FILES HANDLING PROPRE
    if (field.multiple && maxFiles && merged.length > maxFiles) {
      newErrors.maxFiles = `Vous ne pouvez pas dépasser ${maxFiles} fichiers`;

      toast.error(`Maximum ${maxFiles} fichiers autorisés`);

      merged = merged.slice(0, maxFiles);
    }

    setErrors(newErrors);

    if (field.multiple) {
      field.onChange(merged);
    } else {
      field.onChange(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const current = Array.isArray(field.value)
      ? field.value
      : field.value
        ? [field.value]
        : [];

    const updated = current.filter((_, i) => i !== index);

    field.onChange(updated);

    // 🔥 reset erreur maxFiles si présent
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.maxFiles;
      return copy;
    });
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
          "relative flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-10 text-center  duration-150 transition-all hover:border-brand-primary ",
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
            "hover:text-brand-primary text-muted-foreground/60",
            isDragging ?? "text-brand-primary",
          )}
        ></UploadCloud>
        <p
          className={cn(
            "text-sm font-medium hover:text-brand-primary text-muted-foreground/60",
            isDragging ?? "text-brand-primary",
          )}
        >
          Glissez et déposez des fichiers ici ou cliquez pour importer
        </p>
        <p
          className={cn(
            "text-xs mt-1 hover:text-brand-primary text-muted-foreground/60",
            isDragging ?? "text-brand-primary",
          )}
        >
          {field.maxFiles && `Nombre max ${field.maxFiles} fichiers`}
          {field.maxSize && ` • Taille max ${field.maxSize} Mo`}
        </p>

        <Button type="button" variant="brand" className="mt-3 text-white">
          {field.multiple
            ? "Plusieurs fichiers acceptés"
            : "Un seul fichier uniquement"}
        </Button>
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
