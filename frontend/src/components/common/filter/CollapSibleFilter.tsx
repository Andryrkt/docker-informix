import { useForm } from "@tanstack/react-form";

import { ChevronDownIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FilterFieldRenderer } from "../renderer/FilterFieldRenderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FilterField } from "./schema/filterSchema";

export default function CollapsibleFilter({
  fields,
  onSearch,
  onReset,
  title = "Formulaire de recherche",
  defaultOpen = false,
  className,
}: {
  fields: FilterField[][];
  onSearch: (v: any) => void;
  onReset?: () => void;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
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
        <div className="flex cursor-pointer items-center justify-between  bg-amber-400 px-6 py-4 select-none rounded-t-sm ">
          <h3 className="font-medium">{title}</h3>

          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="p-2  CollapsibleContent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="
    grid gap-4
    grid-cols-1
    lg:grid-cols-4
    xl:grid-cols-6
  "
        >
          {fields.map((row, rowIndex) => (
            <div key={rowIndex} className={cn("flex flex-col gap-1")}>
              {row.map((field) => (
                <form.Field key={field.name} name={field.name as any}>
                  {(f) => (
                    <div className="space-y-1">
                      {(field.type !== "boolean" || !field.hideLabel) && (
                        <label className="text-xs font-semibold">
                          {field.label}
                        </label>
                      )}
                      <FilterFieldRenderer
                        field={{
                          ...field,
                          value: f.state.value,
                          onChange: f.handleChange,
                        }}
                      />
                    </div>
                  )}
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
