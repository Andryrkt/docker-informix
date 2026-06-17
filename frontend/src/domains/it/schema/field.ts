export type SupportField =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "textarea";
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      placeholder?: string;
      queryKey: string;
      queryFn: () => Promise<{ label: string; value: string }[]>;
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "date";
    }
  | {
      name: string;
      label: string;
      type: "file";
      multiple?: boolean;
    };
export const demandeFields: SupportField[] = [
  {
    name: "object",
    label: "Objet",
    type: "text",
    placeholder: "Objet de la demande",
  },
  {
    name: "details",
    label: "Détails",
    type: "textarea",
    placeholder: "Décrivez votre demande",
  },
];
