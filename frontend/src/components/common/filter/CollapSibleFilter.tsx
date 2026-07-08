import { useForm } from "@tanstack/react-form";
import { ChevronDownIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FilterFieldRenderer } from "../renderer/FilterFieldRenderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FilterField, FilterOption } from "./schema/filterSchema";
import { Checkbox } from "@/components/ui/checkbox";

export default function CollapsibleFilter({
  fields,
  onSearch,
  onReset,
  onFieldChange,
  title = "Formulaire de recherche",
  defaultOpen = false,
  className,
}: {
  fields: FilterField[][];
  onSearch: (v: any) => void;
  onReset?: () => void;
  onFieldChange?: (name: string, value: any) => void;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // State to store fetched options per field
  const [fieldOptions, setFieldOptions] = useState<
    Record<string, FilterOption[]>
  >({});

  // Build reverse dependency map – only for multichoice fields with dependsOn
  const reverseDeps = useMemo(() => {
    const map: Record<string, string[]> = {};
    fields.flat().forEach((field) => {
      if (field.type === "multichoice" && field.dependsOn) {
        field.dependsOn.forEach((dep) => {
          if (!map[dep]) map[dep] = [];
          map[dep].push(field.name);
        });
      }
    });
    return map;
  }, [fields]);

  // Fetch options for fields that have queryFn
  useEffect(() => {
    const fetchAll = async () => {
      const newOptions: Record<string, FilterOption[]> = {};
      const allFields = fields.flat();
      for (const field of allFields) {
        // Only fetch if queryFn exists (select, multichoice, radio may have it)
        if (
          (field as any).queryFn &&
          typeof (field as any).queryFn === "function"
        ) {
          try {
            const opts = await (field as any).queryFn();
            newOptions[field.name] = opts;
          } catch (err) {
            console.error(`Failed to fetch options for ${field.name}`, err);
            newOptions[field.name] = [];
          }
        }
      }
      setFieldOptions(newOptions);
    };

    fetchAll();
  }, [fields]);

  const form = useForm({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      onSearch(value);
    },
  });

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("m-auto max-w-7xl", className)}
    >
      {/* HEADER */}
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between bg-amber-400 px-6 py-4 select-none rounded-t-sm">
          <h3 className="font-medium">{title}</h3>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="p-2 CollapsibleContent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-4 grid-cols-1 lg:grid-cols-4 xl:grid-cols-6"
        >
          {fields.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-col gap-1">
              {row.map((field) => (
                <form.Field key={field.name} name={field.name as any}>
                  {(f) => {
                    // Get options from fetched or static source
                    const options =
                      fieldOptions[field.name] ||
                      (field.type === "multichoice" ||
                      field.type === "select" ||
                      field.type === "radio"
                        ? (field as any).options
                        : []) ||
                      [];
                    let currentValue = f.state.value;

                    if (field.type === "multichoice") {
                      currentValue = currentValue || [];
                    } else if (field.type === "boolean") {
                      currentValue = currentValue ?? false;
                    } else if (
                      field.type === "text" ||
                      field.type === "number"
                    ) {
                      currentValue = currentValue ?? "";
                    } else if (field.type === "select") {
                      currentValue = currentValue ?? "";
                    }
                    const allSelected =
                      options.length > 0 &&
                      Array.isArray(options) &&
                      options.every((opt: any) =>
                        (currentValue as any).includes(opt.value),
                      );

                    // Build field with merged options
                    const fieldWithOptions = {
                      ...field,
                      options,
                      value: currentValue,
                      placeholder: (field as any).placeholder,
                      onChange: (value: any) => {
                        f.handleChange(value);
                        onFieldChange?.(field.name, value);
                        // Clear dependents only if this field is a dependency source
                        const dependents = reverseDeps[field.name] || [];
                        dependents.forEach((depName) => {
                          form.setFieldValue(depName, []);
                        });
                      },
                    };

                    return (
                      <div className="space-y-1">
                        {(field.type !== "boolean" || !field.hideLabel) && (
                          <label className="text-xs font-semibold">
                            {field.label}
                          </label>
                        )}

                        {/* Select All checkbox – only for multichoice with selectAll flag */}
                        {field.type === "multichoice" &&
                          field.selectAll &&
                          options.length > 0 && (
                            <div className="flex items-center gap-2 mb-1">
                              <Checkbox
                                id={`select-all-${field.name}`}
                                checked={allSelected}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? options.map((opt) => opt.value)
                                    : [];
                                  f.handleChange(newValue);
                                  onFieldChange?.(field.name, newValue);
                                  // Clear dependents if any
                                  const dependents =
                                    reverseDeps[field.name] || [];
                                  dependents.forEach((depName) => {
                                    form.setFieldValue(depName, []);
                                  });
                                }}
                              />
                              <label
                                htmlFor={`select-all-${field.name}`}
                                className="text-sm cursor-pointer"
                              >
                                Tout sélectionner
                              </label>
                            </div>
                          )}

                        <FilterFieldRenderer field={fieldWithOptions} />
                      </div>
                    );
                  }}
                </form.Field>
              ))}
            </div>
          ))}

          <div className="col-span-full flex justify-end gap-2 p-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setFieldOptions({}); // clear fetched options
                onReset?.();
              }}
              className="flex items-center gap-2"
            >
              <RotateCcwIcon className="h-4 w-4" />
              Effacer
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Recherche
            </Button>
          </div>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
