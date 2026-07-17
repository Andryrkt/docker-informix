import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface DynamicSearchableSelectProps<T extends Record<string, any>> {
  value?: string | number;
  onChange?: (item: T) => void;
  options: T[];
  valueField?: keyof T;
  labelFields?: (keyof T)[];
  searchFields?: (keyof T)[];
  separator?: string;
  placeholder?: string;
  disabled?: boolean;
  renderOption?: (item: T) => React.ReactNode;
  renderSelected?: (item: T) => React.ReactNode;
  clearable?: boolean;
  clearLabel?: string;
}

export function DynamicSearchableSelect<T extends Record<string, any>>({
  value,
  onChange,
  options = [],
  valueField = "id" as keyof T,
  labelFields,
  searchFields,
  separator = " – ",
  placeholder = "-- Choisir --",
  disabled = false,
  renderOption,
  renderSelected,
  clearable = false,
  clearLabel = "Aucun",
}: DynamicSearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);

  // Prepend clear option if clearable
  const displayOptions = useMemo(() => {
    if (!clearable) return options;
    const clearItem = { [valueField]: "" } as T;
    return [clearItem, ...options];
  }, [options, clearable, valueField]);

  // Helper: check if item is the clear option
  const isClearItem = (item: T) => clearable && String(item[valueField]) === "";

  const selectedItem = useMemo(
    () =>
      displayOptions.find((item) => String(item[valueField]) === String(value)),
    [displayOptions, value, valueField],
  );

  // Display for selected item (button label)
  const getSelectedDisplay = (item: T) => {
    if (isClearItem(item)) return clearLabel;
    if (renderSelected) return renderSelected(item);
    if (!labelFields) return String(item[valueField]);
    return labelFields.map((key) => String(item[key] ?? "")).join(separator);
  };

  // Display for dropdown items
  const getDropdownLabel = (item: T) => {
    if (isClearItem(item)) return clearLabel;
    if (renderOption) return renderOption(item);
    if (!labelFields) return String(item[valueField]);
    return labelFields.map((key) => String(item[key] ?? "")).join(separator);
  };

  // Searchable text – clear item only returns clearLabel
  const getSearchableText = (item: T) => {
    if (isClearItem(item)) return clearLabel;
    const keys = searchFields ?? (Object.keys(item) as (keyof T)[]);
    return keys
      .map((key) => String(item[key] ?? ""))
      .filter(Boolean)
      .join(" ");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate text-left flex-1">
            {selectedItem ? getSelectedDisplay(selectedItem) : clearLabel}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command className="w-full">
          <CommandInput placeholder="Recherche..." />
          <CommandList>
            <CommandEmpty>Pas de résultats.</CommandEmpty>
            <CommandGroup>
              {displayOptions.map((item) => {
                const itemValue = String(item[valueField]);
                const label = getDropdownLabel(item);
                const searchText = getSearchableText(item);

                return (
                  <CommandItem
                    key={itemValue}
                    value={searchText}
                    onSelect={() => {
                      onChange?.(item);
                      setOpen(false);
                    }}
                  >
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
