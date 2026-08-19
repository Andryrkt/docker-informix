import { useState, useMemo } from "react";
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
import { getMateriels } from "@/domains/materiel/api/materielApi";

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

  const { data: allMateriels = [], isLoading } = useQuery({
    queryKey: ["materiels-all"],
    queryFn: getMateriels,
    staleTime: 1000 * 60 * 5,
  });

  const selectedMateriel = useMemo(() => {
    if (!value) return null;
    return allMateriels.find((m) => String(m.idMateriel) === String(value));
  }, [allMateriels, value]);

  const filteredMateriels = useMemo(() => {
    if (!inputValue.trim()) return allMateriels;
    const term = inputValue.toLowerCase().trim();
    return allMateriels.filter((item) => {
      const id = String(item.idMateriel ?? "").toLowerCase();
      const parc = String(item.numParc ?? "").toLowerCase();
      const serie = String(item.numSerie ?? "").toLowerCase();
      const constructeur = String(item.constructeur ?? "").toLowerCase();
      const designation = String(item.designation ?? "").toLowerCase();
      const modele = String(item.modele ?? "").toLowerCase();

      return (
        id.includes(term) ||
        parc.includes(term) ||
        serie.includes(term) ||
        constructeur.includes(term) ||
        designation.includes(term) ||
        modele.includes(term)
      );
    });
  }, [allMateriels, inputValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate text-left flex-1 text-sm text-muted-foreground">
            {value ? (
              selectedMateriel ? (
                `ID : ${selectedMateriel.idMateriel}${
                  selectedMateriel.numParc
                    ? ` — Parc : ${selectedMateriel.numParc}`
                    : ""
                }`
              ) : (
                `ID : ${value}`
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <div className="flex items-center gap-1 ml-2">
            <ChevronsUpDown className="h-4 w-4 opacity-70" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0  text-brand-primary border-brand-dark">
        <Command
          shouldFilter={false}
          className="bg-brand-dark text-brand-primary"
        >
          <CommandInput
            placeholder="N° parc, N° série, désignation ou N° ID..."
            value={inputValue}
            onValueChange={setInputValue}
            className="text-brand-primary placeholder:text-brand-primary/60 "
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-brand-primary/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des matériels...
              </div>
            )}

            {!isLoading && filteredMateriels.length === 0 && (
              <CommandEmpty className="text-brand-primary/70">
                Aucun matériel trouvé.
              </CommandEmpty>
            )}

            {!isLoading && filteredMateriels.length > 0 && (
              <CommandGroup>
                {filteredMateriels.map((item) => (
                  <CommandItem
                    key={item.idMateriel}
                    value={String(item.idMateriel)}
                    onSelect={() => {
                      onChange?.(item);
                      setOpen(false);
                      setInputValue("");
                    }}
                    className="data-[selected=true]:bg-brand-primary/20 data-[selected=true]:text-brand-primary hover:bg-brand-primary/10 text-brand-primary"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        ID : {item.idMateriel} — Parc : {item.numParc ?? "—"} —
                        S/N : {item.numSerie ?? "—"}
                      </span>
                      <span className="text-xs text-brand-primary/70">
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
