import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "../atom/SearchableSelect";
import { useFilterOptions } from "../filter/hook/filterHook";
import { getOptions } from "@/helper/helper";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
          disabled={field.disabled}
          readOnly={field.readOnly}
        />
      );

    case "textarea":
      return (
        <Textarea
          placeholder={field.placeholder}
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value)}
          disabled={field.disabled}
          readOnly={field.readOnly}
        />
      );

    case "select": {
      const options = getOptions(field, optionsQuery);
      if (optionsQuery?.isLoading) {
        return (
          <div className="text-xs text-muted-foreground">Chargement...</div>
        );
      }

      return (
        <SearchableSelect
          value={field.value}
          onChange={field.onChange}
          options={options ?? []}
          placeholder={field.placeholder}
          disabled={field.disabled}
        />
      );
    }

    case "date":
      return (
        <Input
          type="date"
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value)}
          disabled={field.disabled}
          readOnly={field.readOnly}
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
            disabled={field.disabled}
            readOnly={field.readOnly}
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
            disabled={field.disabled}
            readOnly={field.readOnly}
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
          disabled={field.disabled}
          readOnly={field.readOnly}
        />
      );
    // MULTICHOICE (checkbox group)
    case "multichoice": {
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
                  disabled={field.disabled}
                  readOnly={field.readOnly}
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
    case "radio": {
      if (optionsQuery?.isLoading) {
        return <div className="text-xs text-gray-400">Loading...</div>;
      }

      const options = getOptions(field, optionsQuery);

      return (
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          disabled={field.disabled}
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
    case "boolean": {
      const value = Boolean(field.value);

      switch (field.variant) {
        case "checkbox":
          return (
            <div className="my-2">
              <Checkbox
                disabled={field.disabled}
                checked={value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
            </div>
          );

        case "radio":
          return (
            <RadioGroup
              value={value ? "true" : "false"}
              onValueChange={(v) => field.onChange(v === "true")}
              disabled={field.disabled}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="true" id={`${field.name}-true`} />
                <label htmlFor={`${field.name}-true`}>
                  {field.trueLabel ?? "Oui"}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem value="false" id={`${field.name}-false`} />
                <label htmlFor={`${field.name}-false`}>
                  {field.falseLabel ?? "Non"}
                </label>
              </div>
            </RadioGroup>
          );

        case "switch":
        default:
          return (
            <div className="my-2">
              <Switch
                checked={value}
                onCheckedChange={field.onChange}
                disabled={field.disabled}
              />
            </div>
          );
      }
    }

    case "multiSelect": {
      const options = field.options ?? [];

      const selectedValue = field.value ?? options[0]?.value ?? "";

      return (
        <Select
          value={selectedValue}
          onValueChange={field.onChange}
          disabled={field.disabled}
        >
          <SelectTrigger className="w-full uppercase">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {options.map((option: any) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="uppercase"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    default:
      return null;
  }
}

type ReadOnlyFieldProps = {
  label: string;
  value?: any;
  className?: string;
};

export function FieldReadOnly({ label, value, className }: ReadOnlyFieldProps) {
  return (
    <div className={cn("space-y-1 w-full", className)}>
      <label className="text-xs font-medium text-gray-800">{label}</label>
      <Input
        readOnly
        value={value ?? ""}
        className="font-semibold bg-gray-100"
      />
    </div>
  );
}
