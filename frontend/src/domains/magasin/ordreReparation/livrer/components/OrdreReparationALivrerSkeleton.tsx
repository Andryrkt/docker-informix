import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function OrdreReparationLivrerSkeleton() {
  return (
    <div className="w-full overflow-auto relative ">
      <Table className="min-w-max text-xs">
        <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0">
          <TableRow className="hover:bg-brand-dark border-b-0">
            <TableHead>N° DIT</TableHead>
            <TableHead className="text-center">N° OR</TableHead>
            <TableHead className="text-center">Date Planning</TableHead>
            <TableHead className="text-center">Niv. Urgence</TableHead>
            <TableHead className="text-center">Date OR</TableHead>
            <TableHead>Agence Émetteur</TableHead>
            <TableHead>Service Émetteur</TableHead>
            <TableHead>Agence Débiteur</TableHead>
            <TableHead>Service Débiteur</TableHead>
            <TableHead>N° ITV</TableHead>
            <TableHead>N° Ligne</TableHead>
            <TableHead>Constructeur</TableHead>
            <TableHead className="text-center">Réf</TableHead>
            <TableHead className="text-start">Désignation</TableHead>
            <TableHead className="text-center">Qté Demandée</TableHead>
            <TableHead className="text-center">Qté à Livrer</TableHead>
            <TableHead className="text-center">Qté Déjà Livrée</TableHead>
            <TableHead>Utilisateur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 20 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 18 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default OrdreReparationLivrerSkeleton;
