import { useForm } from "@tanstack/react-form";

import { ChevronDownIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import type { FilterField } from "./schema/filterSchema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FilterFieldRenderer } from "./FilterFieldRenderer";
import { Button } from "@/components/ui/button";

export default function CollapsibleFilter({
  fields,
  onSearch,
  onReset,
  title = "Formulaire de recherche",
  defaultOpen = false,
}: {
  fields: FilterField[];
  onSearch: (v: any) => void;
  onReset?: () => void;
  title?: string;
  defaultOpen?: boolean;
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
      className="m-auto max-w-7xl border"
    >
      {/* HEADER */}
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between  bg-amber-400 px-6 py-4 select-none">
          <h3 className="font-medium">{title}</h3>

          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-6 py-2">
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
          {fields.map((field) => (
            <form.Field key={field.name} name={field.name as any}>
              {(f) => (
                <div className="space-y-1">
                  <label className="text-xs font-semibold">{field.label}</label>
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
