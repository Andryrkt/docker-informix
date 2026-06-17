import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "../atom/SearchableSelect";
import { useFilterOptions } from "../filter/hook/filterHook";

export function FieldRenderer({ field }: any) {
  const isSelect = field.type === "select";

  const optionsQuery = useFilterOptions(
    field.queryKey,
    field.queryFn,
    isSelect && (field.enabled ?? true),
  );

  switch (field.type) {
    case "text":
    case "number":
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value)}
        />
      );

    case "textarea":
      return (
        <Textarea
          placeholder={field.placeholder}
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value)}
        />
      );

    case "select": {
      if (optionsQuery?.isLoading) {
        return (
          <div className="text-xs text-muted-foreground">Chargement...</div>
        );
      }

      return (
        <SearchableSelect
          value={field.value}
          onChange={field.onChange}
          options={optionsQuery?.data ?? []}
          placeholder={field.placeholder}
        />
      );
    }

    case "date":
      return (
        <Input
          type="date"
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value)}
        />
      );

    case "date-range": {
      const value = field.value ?? {
        from: "",
        to: "",
      };

      return (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={value.from}
            onChange={(e) =>
              field.onChange({
                ...value,
                from: e.target.value,
              })
            }
          />

          <Input
            type="date"
            value={value.to}
            onChange={(e) =>
              field.onChange({
                ...value,
                to: e.target.value,
              })
            }
          />
        </div>
      );
    }

    case "file":
      return (
        <Input
          type="file"
          multiple={field.multiple}
          onChange={(e) => {
            const files = e.target.files;
            field.onChange(files ? Array.from(files) : []);
          }}
        />
      );

    default:
      return null;
  }
}
