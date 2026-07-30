export type FilterOption = {
  label: string;
  value: string | number | boolean;
};

export type FilterField =
  | {
      name: string;
      label: string;
      type: "text" | "number";
      placeholder?: string;
      validate?: (value: string) => boolean;
    }
  | {
      name: string;
      label: string;
      type: "select";
      placeholder?: string;
      queryKey?: string;
      queryFn?: () => Promise<FilterOption[]>;
      options?: FilterOption[];
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "date-range";
    }
  | {
      name: string;
      label: string;
      type: "date";
    }
  | {
      name: string;
      label: string;
      type: "multichoice";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<FilterOption[]>;
      options?: FilterOption[];
      enabled?: boolean;
      dependsOn?: string[];
      selectAll?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "radio";
      direction?: "horizontal" | "vertical";
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<FilterOption[]>;
      // static mode
      options?: FilterOption[];

      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "boolean";
      variant?: "switch" | "checkbox" | "radio";
      placeholder?: string;
      trueLabel?: string;
      falseLabel?: string;
      hideLabel: boolean;
      enabled?: boolean;
    };
