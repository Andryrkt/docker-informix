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
import { FileDropzone } from "../atom/FileDropZone";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DynamicSearchableSelect } from "../atom/DynamicSearchableSelect";
import { t } from "i18next";

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

    case "textarea": {
      const { maxLength, newlinePenalty = 0 } = field;
      const value: string = field.value ?? "";

      const adjustedLength = (text: string) => {
        const lineBreaks = (text.match(/\n/g) || []).length;
        return text.length + lineBreaks * newlinePenalty;
      };

      const remaining =
        maxLength !== undefined ? maxLength - adjustedLength(value) : null;

      return (
        <div className="space-y-1 w-full ">
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => {
              let text = e.target.value;

              if (maxLength !== undefined) {
                let excess = adjustedLength(text) - maxLength;
                while (excess > 0 && text.length > 0) {
                  const lastChar = text[text.length - 1];
                  excess -=
                    lastChar === "\n" && newlinePenalty > 0
                      ? newlinePenalty
                      : 1;
                  text = text.slice(0, -1);
                }
              }

              if (field.validate && !field.validate(text)) {
                return;
              }

              field.onChange(text);
            }}
            disabled={field.disabled}
            readOnly={field.readOnly}
            wrap="hard"
            className="whitespace-pre-wrap lg:max-w-6xl md:max-w-4xl"
          />
          {remaining !== null && (
            <p
              className={cn(
                "text-xs",
                remaining <= 0 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {t("il-vous-reste")} {Math.max(remaining, 0)} {t("caracteres")}.
            </p>
          )}
        </div>
      );
    }

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
    case "dynamicSelect": {
      const options = getOptions(field, optionsQuery);
      if (optionsQuery?.isLoading) {
        return (
          <div className="text-xs text-muted-foreground">Chargement...</div>
        );
      }

      return (
        <DynamicSearchableSelect
          value={field.value}
          onChange={field.onChange}
          options={field.options ?? []}
          valueField={field.valueField ?? "id"}
          labelFields={field.labelFields ?? ["label"]}
          searchFields={field.searchFields}
          separator={field.labelSeparator ?? " – "}
          placeholder={field.placeholder ?? "-- Choisir --"}
          disabled={field.disabled}
          clearable={field.clearable}
          clearLabel={field.clearLabel}
          renderOption={field.renderOption} // <-- Add
          renderSelected={field.renderSelected} // <-- Add
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
    // Dragaple FileZone

    case "dragfile":
      return <FileDropzone field={field} />;

    // MULTICHOICE (checkbox group)
    case "multichoice": {
      if (optionsQuery?.isLoading) {
        return <div className="text-xs text-gray-400">Chargement...</div>;
      }

      const options = getOptions(field, optionsQuery);
      const value: string[] = field.value ?? [];

      return (
        <div className="space-y-2">
          {options.map((opt: any) => {
            const checked = value.includes(opt.value);

            return (
              <div key={opt.value} className="flex items-center gap-2 ">
                <Checkbox
                  checked={checked}
                  disabled={field.disabled}
                  onCheckedChange={(checked) => {
                    field.onChange(
                      checked
                        ? [...value, opt.value]
                        : value.filter((v: string) => v !== opt.value),
                    );
                  }}
                />
                <span
                  className={cn(
                    "text-sm",
                    field.disabled ? "text-brand-dark/50" : " ",
                  )}
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    // RADIO
    case "radio": {
      if (optionsQuery?.isLoading) {
        return <div className="text-xs text-gray-400">Chargement...</div>;
      }

      const options = getOptions(field, optionsQuery);

      const value =
        field.value ?? (options.length > 0 ? options[0].value : undefined);

      return (
        <RadioGroup
          value={value}
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

    // Multichoice table
    case "multichoice-table": {
      if (optionsQuery?.isLoading) {
        return (
          <div className="text-xs text-muted-foreground">Chargement...</div>
        );
      }

      const options = getOptions(field, optionsQuery);
      const value: string[] = field.value ?? [];

      const toggleValue = (optionValue: string, checked: boolean) => {
        field.onChange(
          checked
            ? [...value, optionValue]
            : value.filter((v) => v !== optionValue),
        );
      };

      const columns = field.columns ?? [];

      return (
        <div className="overflow-auto lg:max-h-60 max-h-100 rounded-sm border">
          <Table className="text-base">
            {/* HEADER */}
            <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0 z-50 ">
              <TableRow className="h-5 hover:bg-brand-dark data-[state=selected]:bg-brand-dark">
                <TableHead className="w-14 text-center text-white text-sm hover:bg-brand-dark" />

                {columns.map((col: any) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "text-white text-sm font-semibold",
                      col.className,
                    )}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* BODY */}
            <TableBody>
              {options.map((option: any) => {
                const checked = value.includes(option.value);

                return (
                  <TableRow
                    key={option.value}
                    className={cn(
                      " transition",
                      checked ? "bg-brand-dark/5" : "hover:bg-brand-dark/5",
                    )}
                  >
                    {/* CHECKBOX */}
                    <TableCell className=" px-4">
                      <Checkbox
                        checked={checked}
                        disabled={field.disabled}
                        onCheckedChange={(checked) =>
                          toggleValue(option.value, Boolean(checked))
                        }
                        className=" data-[state=checked]:bg-brand-dark data-[state=checked]:text-brand-primary"
                      />
                    </TableCell>

                    {/* DYNAMIC COLUMNS */}
                    {columns.map((col: any) => (
                      <TableCell key={col.key} className=" py-2 text-sm ">
                        {option?.[col.key] ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
    <div className={cn("space-y-1 ", className)}>
      <label className="text-xs font-medium text-gray-800">{label}</label>
      <Input
        readOnly
        value={value ?? ""}
        className="font-semibold bg-gray-100"
      />
    </div>
  );
}
