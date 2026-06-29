import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dit } from "../schema/ditSchema";
import { DitTableSkeleton } from "./DitTableSkeleton";
import { getStatusDevisClass, formatMontant } from "@/helper/helper";
import { MoreVerticalIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import DotsMenu from "./Dots.Menu";

function DitTable({ dit, loading }: { dit: Dit[]; loading: boolean }) {
  // if (loading) return <DitTableSkeleton></DitTableSkeleton>;
  return (
    <div className="w-full overflow-auto py-4">
      <Table className="  min-w-max text-xs">
        <TableHeader className=" bg-brand-dark  [&_th]:text-white">
          <TableRow className="hover:bg-brand-dark border-b-0 ">
            <TableHead>
              <MoreVerticalIcon className="h-4 w-4" />
            </TableHead>
            <TableHead className="  px-4 text-center  ">Statut</TableHead>
            <TableHead>N° DIT</TableHead>
            <TableHead className=" wrap-break-word whitespace-normal max-w-20">
              Réalisé par
            </TableHead>
            <TableHead className=" wrap-break-word whitespace-normal max-w-10">
              Type document
            </TableHead>
            <TableHead className=" wrap-break-word whitespace-normal max-w-20">
              Niv. urgence
            </TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>N° Série</TableHead>
            <TableHead>N° Parc</TableHead>
            <TableHead className=" wrap-break-word whitespace-normal max-w-20 text-center">
              Date Demande
            </TableHead>
            <TableHead>Int / Ext</TableHead>
            <TableHead>Emetteur</TableHead>
            <TableHead>Débiteur</TableHead>
            <TableHead>Objet</TableHead>
            <TableHead className=" wrap-break-word whitespace-normal max-w-20 text-center">
              Section affectée
            </TableHead>
            <TableHead className=" wrap-break-word whitespace-normal max-w-30 text-center">
              N° devis
            </TableHead>
            <TableHead className=" wrap-break-word text-center max-w-20">
              Statut Devis
            </TableHead>
            <TableHead>N° OR</TableHead>
            <TableHead>Statut OR</TableHead>
            <TableHead className=" wrap-break-word  whitespace-normal text-center max-w-20 ">
              Montant Total OR
            </TableHead>
            <TableHead className=" wrap-break-word  whitespace-normal text-center w-10">
              Date Soumission OR
            </TableHead>
            <TableHead className=" wrap-break-word  whitespace-normal text-center w-10">
              Statut facture
            </TableHead>
            <TableHead>RI</TableHead>
            <TableHead>Nbr PJ</TableHead>
            <TableHead>Utilisateur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dit?.map((d, index) => {
            return (
              <TableRow
                className="font-mono text-gray-600  wrap-break-word whitespace-normal text-center text-[0.65rem]"
                key={index}
              >
                <TableCell className=" font-mono text-gray-600  max-w-auto">
                  <DotsMenu
                    numeroDemandeIntervention={d.numeroDemandeIntervention}
                  ></DotsMenu>
                </TableCell>

                <TableCell
                  className={cn(
                    "font-mono max-w-30 whitespace-normal wrap-break-word text-center py-6 px-6 border",
                    getStatusDevisClass(d.statutDemande ? d.statutDemande : ""),
                  )}
                >
                  {d.statutDemande ? d.statutDemande : "-"}
                </TableCell>

                <TableCell>
                  <Link
                    to={
                      "/atelier/demande-intervention/details/" +
                      d.numeroDemandeIntervention
                    }
                    target="_blank"
                    className="text-black hover:underline"
                  >
                    {d.numeroDemandeIntervention}
                  </Link>
                </TableCell>

                <TableCell className=" font-mono text-gray-600">
                  {d.reparationRealise}
                </TableCell>

                <TableCell className=" font-mono text-gray-600 text-center  wrap-break-word whitespace-normal max-w-20 text-[0.6rem]">
                  {d.typeDocument}
                </TableCell>

                <TableCell className=" font-mono text-gray-600 text-start w-fit">
                  {d.worNiveauUrgence}
                </TableCell>

                <TableCell className=" font-mono text-gray-600 wrap-break-word whitespace-normal">
                  {d.categorieDemande}
                </TableCell>

                <TableCell className=" font-mono text-gray-600 ">
                  {d.numSerie}
                </TableCell>

                <TableCell className=" font-mono text-gray-600">
                  {d.numParc}
                </TableCell>

                <TableCell className=" font-mono text-gray-600 wrap-break-word whitespace-normal max-w-20 text-[0.6rem]">
                  {d.dateDemande}
                </TableCell>

                <TableCell>{d.interneExterne}</TableCell>

                <TableCell>{d.agenceEmetteur}</TableCell>

                <TableCell>{d.agenceDebiteur}</TableCell>

                <TableCell className=" text-[0.6rem] text-start font-mono text-gray-600  wrap-break-word whitespace-normal max-w-30">
                  {d.objet}
                </TableCell>

                <TableCell className=" font-mono text-gray-600  wrap-break-word whitespace-normal max-w-20">
                  {d.sectionAffectee}
                </TableCell>

                <TableCell>{d.numeroDevisRattache}</TableCell>

                <TableCell className=" font-mono text-gray-600  wrap-break-word whitespace-normal max-w-30 text-[0.6rem]">
                  {d.statutDevis}
                </TableCell>

                <TableCell>{d.numeroOr}</TableCell>

                <TableCell>{d.statutOr}</TableCell>

                <TableCell>{d.montantOr}</TableCell>

                <TableCell>{d.dateSoumissionOr}</TableCell>

                <TableCell>{d.etatFacturation}</TableCell>
                <TableCell>{d.ri}</TableCell>
                <TableCell>{d.nbrPj}</TableCell>
                <TableCell>{d.utilisateurDemandeur}</TableCell>
              </TableRow>
            );
          })}

          {dit?.length === 0 && (
            <TableRow>
              <TableCell className=" font-mono text-gray-600"></TableCell>
              <TableCell
                colSpan={18}
                className="text-center py-6 text-gray-500 font-medium"
              >
                Aucun demande d'intervention trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DitTable;
