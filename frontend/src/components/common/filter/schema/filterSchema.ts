export type FilterOption = {
  label: string;
  value: string | number | boolean;
};

export type BaseFilterField = {
  name: string;
  label: string;
  disabled?: boolean;
  dependsOn?: string[];
};

export type FilterField = BaseFilterField &
  (
    | {
        type: "text" | "number";
        placeholder?: string;
        validate?: (value: string) => boolean;
      }
    | {
        type: "select";
        placeholder?: string;
        queryKey?: string;
        queryFn?: () => Promise<FilterOption[]>;
        options?: FilterOption[];
        enabled?: boolean;
      }
    | {
        type: "date-range";
        min?: string;
        max?: string;
      }
    | {
        type: "date";
        min?: string;
        max?: string;
      }
    | {
        type: "multichoice";
        placeholder?: string;
        queryKey?: string;
        queryFn?: () => Promise<FilterOption[]>;
        options?: FilterOption[];
        enabled?: boolean;
        selectAll?: boolean;
      }
    | {
        type: "radio";
        direction?: "horizontal" | "vertical";
        queryKey?: string;
        queryFn?: () => Promise<FilterOption[]>;
        options?: FilterOption[];
        enabled?: boolean;
      }
    | {
        type: "boolean";
        variant?: "switch" | "checkbox" | "radio";
        placeholder?: string;
        trueLabel?: string;
        falseLabel?: string;
        hideLabel?: boolean;
        enabled?: boolean;
      }
  );
