import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { ChevronsUpDown, Loader2, X } from "lucide-react";
import type { Materiel } from "@/domains/materiel/schema/materielSchema";
import { searchMateriels } from "@/domains/materiel/api/materielApi";

interface MaterielSearchableSelectProps {
  value?: string;
  onChange?: (item: Materiel | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MaterielSearchableSelect({
  value,
  onChange,
  placeholder = "Tapez un N° parc, série ou désignation...",
  disabled = false,
}: MaterielSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleSearchChange = useCallback(
    (term: string) => {
      setInputValue(term);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        setDebouncedTerm(term);
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer],
  );

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["materiels-search", debouncedTerm],
    queryFn: () => searchMateriels(debouncedTerm),
    enabled: debouncedTerm.trim().length >= 2,
    staleTime: 1000 * 60,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate text-left flex-1 text-sm">
            {value ? (
              `ID : ${value}`
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {value && !disabled && (
              <X
                className="h-3 w-3 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(null);
                }}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="N° parc, N° série, désignation ou N° ID..."
            value={inputValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {isFetching && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Recherche...
              </div>
            )}

            {!isFetching && debouncedTerm.trim().length < 2 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Tapez au moins 2 caractères pour rechercher.
              </div>
            )}

            {!isFetching &&
              debouncedTerm.trim().length >= 2 &&
              results.length === 0 && (
                <CommandEmpty>Aucun matériel trouvé.</CommandEmpty>
              )}

            {!isFetching && results.length > 0 && (
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={item.idMateriel}
                    value={item.idMateriel}
                    onSelect={() => {
                      onChange?.(item);
                      setOpen(false);
                      setInputValue("");
                      setDebouncedTerm("");
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        ID : {item.idMateriel} — Parc : {item.numParc ?? "—"} —
                        S/N : {item.numSerie ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {[item.constructeur, item.designation, item.modele]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
