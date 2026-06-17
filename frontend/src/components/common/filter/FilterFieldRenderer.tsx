import { useFilterOptions } from "./hook/filterHook";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "../atom/SearchableSelect";

export function FilterFieldRenderer({ field }: any) {
  const isSelect = field.type === "select";

  const optionsQuery = useFilterOptions(
    field.queryKey,
    field.queryFn,
    isSelect && (field.enabled ?? true),
  );

  if (field.type === "text" || field.type === "number") {
    return (
      <Input
        type={field.type}
        placeholder={field.placeholder}
        onChange={(e) => field.onChange(e.target.value)}
        value={field.value ?? ""}
      />
    );
  }

  if (field.type === "select") {
    if (optionsQuery?.isLoading) {
      return <div className="text-xs text-gray-400">Loading...</div>;
    }

    const options = optionsQuery?.data ?? [];

    return (
      <SearchableSelect
        value={field.value}
        onChange={field.onChange}
        options={options}
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === "date-range") {
    const value = field.value ?? {
      from: "",
      to: "",
    };

    return (
      <div className="space-y-2">
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
      </div>
    );
  }
  if (field.type === "date") {
    return (
      <Input
        type="date"
        value={field.value ?? ""}
        onChange={(e) => field.onChange(e.target.value)}
      />
    );
  }
  return null;
}
