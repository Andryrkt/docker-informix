import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dit } from "../schema/ditSchema";
import { getStatusDevisClass } from "@/helper/helper";
import { MoreVerticalIcon, ToolCase } from "lucide-react";
import { Link } from "react-router-dom";
import { cn, formatDate } from "@/lib/utils";
import DotsMenu, { type MenuAction } from "./Dots.Menu";
import { useCallback, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useConfirm } from "@/components/common/ConfirmDialog";
import DialogSoumissionDocForm from "./DialogSoumissionDocForm";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkDitSubmission } from "../api/ditApi";

function DitTable({ dit, loading }: { dit: Dit[]; loading: boolean }) {
  const navigate = useNavigate();

  const confirm = useConfirm();

  const parentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedDit, setSelectedDit] = useState<Dit | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: dit?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Balanced baseline height matching small text sizes
    overscan: 10, // Pre-renders 10 items out of view to ensure buttery-smooth scrolling with 300+ items
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  const getActions = useCallback((d: Dit) => {
    return [
      {
        label: "Dupliquer",
        to: `/atelier/demande-intervention/duplication/${d.numeroDemandeIntervention}`,
      },
      {
        label: "Soumission document à valider",
        onClick: () => {
          setSelectedDit(d);
          setOpen(true);
        },
      },
      {
        label: "Dossier DIT",
        to: `/atelier/demande-intervention/dossier/${d.numeroDemandeIntervention}`,
      },
      d.statutDemande !== "CLOTUREE VALIDEE" && {
        label: "Clôturer",
        className:
          "text-destructive focus:text-destructive focus:bg-destructive/10",
        onClick: async () => {
          const confirmed = await confirm({
            title: "Voulez vous confirmer cette action?",
            description: "Êtes-vous sûr de vouloir ?",
            confirmText: "Clôturer",
            icon: <ToolCase />,
            cancelText: "Annuler",
            variant: "destructive",
          });
          if (!confirmed) return;
        },
      },
    ].filter(Boolean) as MenuAction[];
  }, []);

  const checkDocumentMutation = useMutation({
    mutationFn: checkDitSubmission,
    onSuccess: (res, variables) => {
      const allowed = res?.data?.allowed;
      // const numeroDevis = res.data.numeroDevis;

      if (allowed) {
        navigate(
          `/atelier/demande-intervention/${variables.document}/${variables.numeroDemandeIntervention}`,
        );
      } else {
        toast.error(
          res.data.message ?? "Document ne peut pas être soumis sur ce DIT",
        );
      }
    },

    onError: () => {
      toast.error("Erreur lors de la vérification du DIT");
    },
  });

  // if (loading) return <DitTableSkeleton></DitTableSkeleton>;

  return (
    <>
      <div
        ref={parentRef}
        className="w-full h-115 overflow-auto  rounded-md relative"
      >
        <Table className="min-w-max text-xs">
          <TableHeader className=" bg-brand-dark  [&_th]:text-white sticky top-0">
            <TableRow className="hover:bg-brand-dark border-b-0  ">
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
            {/* Top Virtual Spacer Row */}
            {paddingTop > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={25}
                  style={{ height: `${paddingTop}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {virtualRows?.map((virtualRow) => {
              const d = dit[virtualRow.index];
              if (!d) return null;

              return (
                <TableRow
                  className="font-mono text-gray-600  wrap-break-word whitespace-normal text-center text-[0.65rem]"
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  <TableCell className=" font-mono text-gray-600  max-w-auto cursor-p">
                    <DotsMenu
                      contentClassName="ml-4 mt-2"
                      actions={getActions(d)}
                    />
                  </TableCell>

                  <TableCell
                    className={cn(
                      "font-mono max-w-30 whitespace-normal wrap-break-word text-center py-6 px-6 border",
                      getStatusDevisClass(
                        d.statutDemande ? d.statutDemande : "",
                      ),
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
                    {formatDate(d.dateDemande)}
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

                  <TableCell>{formatDate(d.dateSoumissionOr)}</TableCell>

                  <TableCell>{d.etatFacturation}</TableCell>
                  <TableCell>{d.ri}</TableCell>
                  <TableCell>{d.nbrPj}</TableCell>
                  <TableCell>{d.utilisateurDemandeur}</TableCell>
                </TableRow>
              );
            })}

            {/* Bottom Virtual Spacer Row */}
            {paddingBottom > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={25}
                  style={{ height: `${paddingBottom}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}
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
      <DialogSoumissionDocForm
        open={open}
        onOpenChange={setOpen}
        numeroDemandeIntervention={selectedDit?.numeroDemandeIntervention}
        onSubmitSoumissionDoc={({ document }) => {
          checkDocumentMutation.mutate({
            document,
            numeroDemandeIntervention: selectedDit?.numeroDemandeIntervention,
          });
        }}
        isLoading={checkDocumentMutation.isPending}
      />
    </>
  );
}

export default DitTable;
