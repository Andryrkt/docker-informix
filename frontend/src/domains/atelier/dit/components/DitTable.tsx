import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dit } from "../schema/ditSchema";
import {
  formatMontant,
  getStatusDevisClass,
  getStatusDitClass,
} from "@/helper/helper";
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
import { Button } from "@/components/ui/button";
import { DitTableSkeleton } from "./DitTableSkeleton";

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

  if (loading) return <DitTableSkeleton></DitTableSkeleton>;

  return (
    <>
      <div ref={parentRef} className="w-full overflow-auto  relative">
        <Table className="min-w-max text-xs">
          <TableHeader className=" bg-brand-dark  [&_th]:text-white sticky top-0">
            <TableRow className="hover:bg-brand-dark border-b-0  ">
              <TableHead>
                <MoreVerticalIcon className="h-4 w-4" />
              </TableHead>
              <TableHead className="  px-4 text-center">Statut</TableHead>
              <TableHead>N° DIT</TableHead>
              <TableHead className=" wrap-break-word whitespace-normal max-w-20 text-center font-bold ">
                Réalisé par
              </TableHead>
              <TableHead className=" wrap-break-word whitespace-normal max-w-10 text-center">
                Type document
              </TableHead>
              <TableHead className=" wrap-break-word whitespace-normal max-w-20 text-center">
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
              <TableHead className=" wrap-break-word whitespace-normal max-w-20 text-start">
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
              <TableHead className=" wrap-break-word  whitespace-normal text-center w-10 ">
                Date Soumission OR
              </TableHead>
              <TableHead className=" wrap-break-word  whitespace-normal text-center w-10">
                Statut facture
              </TableHead>
              <TableHead className=" wrap-break-word  whitespace-normal text-center w-10">
                RI
              </TableHead>
              <TableHead className=" wrap-break-word  whitespace-normal text-center w-10">
                Nbr PJ
              </TableHead>
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
                  className="wrap-break-word whitespace-normal text-center text-[0.7rem] "
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  <TableCell className="    max-w-auto cursor-p ">
                    <DotsMenu
                      contentClassName="ml-4 mt-2"
                      actions={getActions(d)}
                    />
                  </TableCell>

                  <TableCell
                    className={cn(
                      " text-center max-w-20 wrap-break-word whitespace-pre-wrap py-2 font-bold",
                      getStatusDitClass(d.statutDemande ? d.statutDemande : ""),
                    )}
                  >
                    {d.statutDemande ? d.statutDemande : "-"}
                  </TableCell>

                  <TableCell className="px-4 ">
                    <Link
                      to={
                        "/atelier/demande-intervention/details/" +
                        d.numeroDemandeIntervention
                      }
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {d.numeroDemandeIntervention}
                    </Link>
                  </TableCell>

                  <TableCell className=" max-w-10   wrap-break-word whitespace-normal ">
                    {d.reparationRealise}
                  </TableCell>

                  <TableCell className="    wrap-break-word whitespace-normal max-w-20 font-normal ">
                    {d.typeDocument}
                  </TableCell>

                  <TableCell className="   text-center w-fit ">
                    {d.worNiveauUrgence}
                  </TableCell>

                  <TableCell className=" wrap-break-word whitespace-break-spaces text-start  max-w-20  px-2 text-[0.65rem] ">
                    {d.categorieDemande}
                  </TableCell>

                  <TableCell className="  text-start ">{d.numSerie}</TableCell>

                  <TableCell className=" wrap-break-word whitespace-normal max-w-20  ">
                    {d.numParc}
                  </TableCell>

                  <TableCell className="   wrap-break-word whitespace-normal max-w-20 text-[0.6rem]">
                    {formatDate(d.dateDemande)}
                  </TableCell>

                  <TableCell>{d.interneExterne}</TableCell>

                  <TableCell>{d.agenceServiceEmetteur}</TableCell>

                  <TableCell>
                    {d.agenceDebiteur !== null && d.agenceServiceDebiteur}
                  </TableCell>

                  <TableCell className=" px-2 text-start    wrap-break-word whitespace-normal max-w-30">
                    {d.objet}
                  </TableCell>

                  <TableCell className=" text-start   wrap-break-word whitespace-normal max-w-20 text-blue-600 underline">
                    {d.sectionAffectee}
                  </TableCell>

                  <TableCell>{d.numeroDevisRattache}</TableCell>

                  <TableCell className="    wrap-break-word whitespace-normal max-w-20 p-1">
                    {d.statutDevis}
                  </TableCell>

                  <TableCell className="underline ">
                    <Button
                      variant="link"
                      className={cn(
                        " text-[0.6rem] underline  p-0.5 h-fit ",
                        // bg-green-600 hover:bg-green-700 text-white
                      )}
                    >
                      {d.numeroOr}
                    </Button>
                  </TableCell>

                  <TableCell className="font-bold max-w-0 py-2  wrap-break-word whitespace-normal">
                    {d.statutOr}
                  </TableCell>

                  <TableCell>{d.montantOr}</TableCell>

                  <TableCell>{formatDate(d.dateSoumissionOr)}</TableCell>

                  <TableCell>
                    <Button variant="link" className="text-blue-600  ">
                      {d.etatFacturation}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" className="text-blue-600  ">
                      {d.ri}
                    </Button>
                  </TableCell>
                  <TableCell className="max-w-10">{d.nbrPj}</TableCell>
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
                <TableCell className="  "></TableCell>
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
