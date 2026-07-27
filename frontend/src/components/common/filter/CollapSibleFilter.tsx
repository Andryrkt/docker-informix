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
  storageKey,
}: {
  fields: FilterField[][];
  onSearch: (v: any) => void;
  onReset?: () => void;
  onFieldChange?: (name: string, value: any) => void;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
  storageKey?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // If no custom key is provided, use the current pathname as a namespace
  const effectiveStorageKey = useMemo(() => {
    if (storageKey) return storageKey;
    // Use pathname + optional query param to differentiate sub-pages
    // Example: "/users" -> "filter_users"
    const path = window.location.pathname.replace(/\//g, "_") || "root";
    return `filter_${path}`;
  }, [storageKey]);

  const getInitialValues = () => {
    const allFields = fields.flat();

    // 1️⃣ Read URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlValues: Record<string, any> = {};
    allFields.forEach((field) => {
      const value = params.get(field.name);
      if (value !== null) {
        try {
          urlValues[field.name] = JSON.parse(value);
        } catch {
          urlValues[field.name] = value;
        }
      }
    });

    // 2️⃣ Read localStorage
    let storedValues: Record<string, any> = {};
    const stored = localStorage.getItem(effectiveStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        allFields.forEach((field) => {
          if (field.name in parsed) {
            storedValues[field.name] = parsed[field.name];
          }
        });
      } catch {
        // ignore malformed storage
      }
    }

    // 3️⃣ Merge: URL overrides localStorage
    const initial: Record<string, any> = {};
    allFields.forEach((field) => {
      let val = urlValues[field.name] ?? storedValues[field.name];
      // ✅ Convert multichoice URL strings (e.g., "3,4") to arrays
      if (field.type === "multichoice" && typeof val === "string") {
        val = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (val !== undefined) {
        initial[field.name] = val;
      }
    });
    return initial;
  };
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
    defaultValues: getInitialValues(),
    onSubmit: async ({ value }) => {
      onSearch(value);
    },
  });

  useEffect(() => {
    const subscription = form.store.subscribe(() => {
      const currentValues = form.state.values;
      localStorage.setItem(effectiveStorageKey, JSON.stringify(currentValues));
    });
    return () => subscription.unsubscribe();
  }, [form, effectiveStorageKey]);

  const gridClass = cn("grid gap-4 grid-cols-1", {
    "lg:grid-cols-1": fields.length === 1,
    "lg:grid-cols-2": fields.length === 2,
    "lg:grid-cols-3": fields.length === 3,
    "lg:grid-cols-4": fields.length === 4,
    "lg:grid-cols-5": fields.length === 5,
    "lg:grid-cols-6": fields.length >= 6,
  });

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("m-auto max-w-7xl", className)}
    >
      {/* HEADER */}
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between bg-amber-400 px-4 py-4 select-none rounded-t-sm">
          <h3 className="text-sm">{title}</h3>
          <ChevronDownIcon
            className={`h-6 w-6 transition-transform duration-200 ${
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
          className={gridClass}
        >
          {fields.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-col gap-4">
              {row.map((field) => (
                <form.Field key={field.name} name={field.name as any}>
                  {(f) => {
                    // Get options from fetched or static source
                    const baseOptions =
                      fieldOptions[field.name] ||
                      (field.type === "multichoice" ||
                      field.type === "select" ||
                      field.type === "radio"
                        ? (field as any).options
                        : []) ||
                      [];

                    const hasTous = baseOptions.some(
                      (opt) => opt.value === "all",
                    );
                    const options = hasTous ? baseOptions : [...baseOptions];

                    // Exclude "all" for "Select all" logic
                    const nonTousOptions = options.filter(
                      (opt) => opt.value !== "all",
                    );

                    let currentValue = f.state.value;

                    if (field.type === "multichoice") {
                      if (typeof currentValue === "number") {
                        currentValue = String(currentValue);
                      }

                      // Convert string like "3,4" to array ["3","4"]
                      if (typeof currentValue === "string") {
                        currentValue = (currentValue as any)
                          .split(",")
                          .map((s: any) => s.trim())
                          .filter(Boolean);
                      }
                      // Ensure it's always an array
                      if (!Array.isArray(currentValue)) {
                        currentValue = [];
                      }
                    } else if (field.type === "boolean") {
                      currentValue = String(currentValue) ?? false;
                    } else if (
                      field.type === "text" ||
                      field.type === "number"
                    ) {
                      currentValue = String(currentValue) ?? "";
                    } else if (field.type === "select") {
                      console.log(
                        "f.state.value select",
                        field.name + " value:" + f.state.value,
                      );

                      console.log(currentValue, typeof currentValue);
                      currentValue = String(currentValue) ?? "";
                    }

                    // allSelected checks only nonTousOptions
                    const allSelected =
                      nonTousOptions.length > 0 &&
                      Array.isArray(currentValue) &&
                      nonTousOptions.every((opt) =>
                        currentValue.includes(opt.value),
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
                        const dependents = reverseDeps[field.name] || [];
                        dependents.forEach((depName) => {
                          form.setFieldValue(depName, []);
                        });
                      },
                    };
                    return (
                      <div className="space-y-4">
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
                        {field.type === "select" && options.length > 0 && <></>}

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
