import { useFilterOptions } from "./hook/filterHook";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "../atom/SearchableSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getOptions } from "@/helper/helper";
import { Switch } from "@/components/ui/switch";

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
        type={field.type === "number" ? "text" : field.type}
        inputMode={field.type === "number" ? "numeric" : undefined}
        pattern={field.pattern}
        placeholder={field.placeholder}
        value={field.value ?? ""}
        onChange={(e) => {
          const value = e.target.value;

          if (field.validate && !field.validate(value)) {
            return;
          }

          field.onChange(value);
        }}
      />
    );
  }
  if (field.type === "select") {
    if (optionsQuery?.isLoading) {
      return <div className="text-xs text-gray-400">Chargement...</div>;
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
  // MULTICHOICE (checkbox group)
  if (field.type === "multichoice") {
    if (optionsQuery?.isLoading) {
      return <div className="text-xs text-gray-400">Loading...</div>;
    }

    const options = getOptions(field, optionsQuery);
    const value: string[] = field.value ?? [];

    return (
      <div className="space-y-2">
        {options.map((opt: any) => {
          const checked = value.includes(opt.value);

          return (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                checked={checked}
                onCheckedChange={(checked) => {
                  field.onChange(
                    checked
                      ? [...value, opt.value]
                      : value.filter((v: string) => v !== opt.value),
                  );
                }}
              />
              <span className="text-sm">{opt.label}</span>
            </div>
          );
        })}
      </div>
    );
  }
  // RADIO
  if (field.type === "radio") {
    if (optionsQuery?.isLoading) {
      return <div className="text-xs text-gray-400">Loading...</div>;
    }

    const options = getOptions(field, optionsQuery);

    return (
      <RadioGroup
        value={field.value}
        onValueChange={field.onChange}
        className={
          field.direction === "horizontal"
            ? "flex gap-4"
            : "flex flex-col gap-2"
        }
      >
        {options.map((opt: any) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} />
            <span className="text-sm">{opt.label}</span>
          </div>
        ))}
      </RadioGroup>
    );
  }

  // BOOLEAN
  if (field.type === "boolean") {
    const value = Boolean(field.value);

    // SWITCH (default)
    if (field.variant === "switch" || !field.variant) {
      return (
        <div className="my-2">
          <Switch checked={value} onCheckedChange={field.onChange} />
        </div>
      );
    }

    // CHECKBOX
    if (field.variant === "checkbox") {
      return (
        <div className="my-2">
          <Checkbox
            checked={value}
            onCheckedChange={(v) => field.onChange(Boolean(v))}
          />
        </div>
      );
    }

    // RADIO
    if (field.variant === "radio") {
      return (
        <RadioGroup
          value={value ? "true" : "false"}
          onValueChange={(v) => field.onChange(v === "true")}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="true" />
            <span>{field.trueLabel ?? "Oui"}</span>
          </div>

          <div className="flex items-center gap-2">
            <RadioGroupItem value="false" />
            <span>{field.falseLabel ?? "Non"}</span>
          </div>
        </RadioGroup>
      );
    }
  }

  return null;
}
