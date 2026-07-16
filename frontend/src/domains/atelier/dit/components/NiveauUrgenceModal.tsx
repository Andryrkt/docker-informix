import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info } from "lucide-react";

const niveauxUrgence = [
  {
    priorite: "P0",
    definition: "Machine à l'arrêt, backup non dispo",
    perteExploitation: "Oui",
    penalites: "Oui",
    delai: "Intervention immédiate",
  },
  {
    priorite: "P1",
    definition: "Machine à l'arrêt, bakup dispo",
    perteExploitation: "Non",
    penalites: "Non",
    delai: "Intervention < 1 semaine / fonction de la dispo de PDR",
  },
  {
    priorite: "P2",
    definition:
      "Maintenance Planifiée\n- Maintenance périodique\n- Nettoyages radiateur\n- Réglage soupape\n- Etc…",
    perteExploitation: "Non",
    penalites: "Non",
    delai: "Intervention < 1 mois",
  },
  {
    priorite: "P3",
    definition: "Révision générale\n- Top END\n- Major Overhaul",
    perteExploitation: "Non",
    penalites: "Non",
    delai: "Intervention > 6 mois",
  },
];

function NiveauUrgenceModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Voir la liste des niveaux d'urgence"
        >
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Liste Niveau d'Urgence</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto">
          <Table className="rounded mt-1">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">
                  Ordre de priorité
                </TableHead>
                <TableHead>Définition</TableHead>
                <TableHead className="text-center">
                  Perte d'exploitation
                </TableHead>
                <TableHead className="text-center">Pénalités</TableHead>
                <TableHead>Délai d'intervention</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {niveauxUrgence.map((n) => (
                <TableRow key={n.priorite}>
                  <TableCell className="text-center font-semibold">
                    {n.priorite}
                  </TableCell>
                  <TableCell className="whitespace-pre-line">
                    {n.definition}
                  </TableCell>
                  <TableCell className="text-center">
                    {n.perteExploitation}
                  </TableCell>
                  <TableCell className="text-center">
                    {n.penalites}
                  </TableCell>
                  <TableCell>{n.delai}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NiveauUrgenceModal;
