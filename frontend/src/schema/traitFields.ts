import type { AnalysisResult, PipelineOptions } from "@/lib/document-analysis";
import { boolean } from "zod";

export const max_size_upload_file =
  Number(import.meta.env.VITE_MAX_SIZE_FILE) || 5;

export type SelectOption = {
  label: string;
  value: string | number | boolean;
};
export type TableChoiceRow = {
  value: string;
  [key: string]: string | number;
};
export type FieldTrait =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "textarea";
      placeholder?: string;
      validate?: (value: string) => boolean;
      readOnly?: boolean;
      /** Longueur maximale (textarea) — un saut de ligne compte pour `newlinePenalty` caractères. Affiche le compteur de caractères restants. */
      maxLength?: number;
      newlinePenalty?: number;
    }
  | {
      name: string;
      label: string;
      type: "select";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      options?: SelectOption[];
      enabled?: boolean;
      readOnly?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "date-range";
      readOnly?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "date";
      readOnly?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "multichoice";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      options?: SelectOption[];
      enabled?: boolean;
      dependsOn?: string[];
      selectAll?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "multichoice-table";

      queryKey?: string;
      queryFn?: () => Promise<TableChoiceRow[]>;
      options?: TableChoiceRow[];

      columns: {
        key: string;
        label: string;
        className?: string;
      }[];

      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "radio";
      direction?: "horizontal" | "vertical";
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      // static mode
      options?: SelectOption[];

      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "boolean";
      variant?: "switch" | "checkbox" | "radio";
      trueLabel?: string;
      falseLabel?: string;
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "file";
      placeholder?: string;
      multiple: boolean;
      pattern: string;
      maxSize: number;
      accept: string;
    }
  | {
      name: string;
      label: string;
      type: "dragfile";
      multiple: boolean;
      maxFiles?: number;
      pattern?: string;
      maxSize: number;
      accept: string;
      ocrValidation?: string | string[] | Partial<PipelineOptions>;
      onResults?: (results: Map<string, AnalysisResult>) => void;
    }
  | {
      name: string;
      label: string;
      type: "multiSelect";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      options?: SelectOption[];
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "dynamicSelect";
      placeholder?: string;
      readOnly?: boolean;
      // async loading
      queryKey?: string;
      queryFn?: () => Promise<Record<string, any>[]>;
      // static options
      options?: Record<string, any>[];
      enabled?: boolean;
      // dynamic configuration
      valueField?: string; // e.g. "id" (default)
      labelFields?: string[]; // e.g. ["designation", "piece"] (default ["label"])
      searchFields?: string[]; // optional, search in all if omitted
      labelSeparator?: string; // default " – "
      clearable?: boolean;
      clearLabel?: string;
      renderOption?: (item: Record<string, any>) => React.ReactNode;
      renderSelected?: (item: Record<string, any>) => React.ReactNode;
    };
