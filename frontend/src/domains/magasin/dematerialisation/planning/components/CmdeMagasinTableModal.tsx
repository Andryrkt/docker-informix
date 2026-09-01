import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import { displayValue } from "@/helper/helper";
import type { ValeurMensuelleEntry } from "../schema/planningCmdeMagasinSchema";
import type { StatutLigne } from "../schema/CmdeMagasinSchema";
import { useQuery } from "@tanstack/react-query";
import { fetchCmdeMagasinLigne } from "../api/cmdeMagasinLigneApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CmdesLigneStatusBadge from "@/components/common/CmdesLigneStatusBadge";
import { useMemo, useState } from "react";
import { cn, getCmdeMagasinStatusClass } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CmdeMagasinModalSkeleton from "./CmdeMagasinTableSkeleton";

interface CmdeMagasinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  month: string;
  entry?: ValeurMensuelleEntry | null;
}

export function CmdeMagasinTableModal({
  open,
  onOpenChange,
  clientName,
  month,
  entry,
}: CmdeMagasinModalProps) {
  const {
    data: cmdesMadasin,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "commandes-magasin-lignes",
      clientName,
      month,
      entry?.value,
      entry?.etat,
    ],
    queryFn: () => {
      if (!entry) throw new Error("Entry data missing");
      return fetchCmdeMagasinLigne(entry, month, clientName);
    },
    enabled: open, // only fetch when dialog is open
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [selectedStatus, setSelectedStatus] = useState<
    StatutLigne | undefined
  >();

  const filteredLignes = useMemo(() => {
    const lignes = cmdesMadasin?.cmdeLignes ?? [];

    if (!selectedStatus) {
      return lignes;
    }

    return lignes.filter((ligne) => ligne.statut === selectedStatus);
  }, [cmdesMadasin?.cmdeLignes, selectedStatus]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setSelectedStatus(undefined);
        }

        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-6xl">
        {isLoading ? (
          <CmdeMagasinModalSkeleton></CmdeMagasinModalSkeleton>
        ) : error ? (
          <div className="text-center text-destructive p-4">
            Erreur lors du chargement
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center text-lg">
                Listes lignes de commande
              </DialogTitle>
              <DialogDescription className="font-semibold text-lg text-green-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span>N° : {displayValue(cmdesMadasin?.numero)}</span>

                  <Separator orientation="vertical" className="h-5" />

                  <span>Intitulé : {displayValue(cmdesMadasin?.intitule)}</span>

                  <Separator orientation="vertical" className="h-5" />

                  <span>Délai : {displayValue(cmdesMadasin?.delaiClient)}</span>
                </div>
              </DialogDescription>
              <div className="flex flex-wrap gap-1.5">
                <CmdesLigneStatusBadge
                  value={selectedStatus}
                  onChange={(status) =>
                    setSelectedStatus((current) =>
                      current === status ? undefined : status,
                    )
                  }
                />
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-auto  max-h-150">
              <Table>
                <TableHeader className="sticky top-0 z-20 bg-brand-dark [&_th]:text-white ">
                  <TableRow className="hover:bg-transparent border-none ">
                    <TableHead className="w-30 font-bold">BCIrium</TableHead>
                    <TableHead className="font-bold">Ligne</TableHead>
                    <TableHead className="font-bold">Commande</TableHead>
                    <TableHead className="font-bold">CST</TableHead>
                    <TableHead className="font-bold">Ref</TableHead>
                    <TableHead className="font-bold">Designation</TableHead>
                    <TableHead className="text-right font-bold">
                      Qte DEM
                    </TableHead>
                    <TableHead className="text-right font-bold">
                      Qte ALL
                    </TableHead>
                    <TableHead className="text-right font-bold">
                      Qte RLQ
                    </TableHead>
                    <TableHead className="text-right font-bold">
                      Qte LIV
                    </TableHead>
                    <TableHead className="font-bold">Statut</TableHead>
                    <TableHead className="font-bold">Date Statut</TableHead>
                    <TableHead className="font-bold">Eta Maurice</TableHead>
                    <TableHead className="font-bold">Eta Magasin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLignes?.length ? (
                    filteredLignes.map((cmdeligne) => (
                      <TableRow key={cmdeligne.id} className="h-16">
                        <TableCell className="font-mono text-xs">
                          {displayValue(cmdeligne.numBCIrium)}
                        </TableCell>

                        <TableCell className="text-center">
                          {displayValue(cmdeligne.ligne)}
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          {displayValue(cmdeligne.numCommande)}
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          {displayValue(cmdeligne.cst)}
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          {displayValue(cmdeligne.ref)}
                        </TableCell>

                        <TableCell>
                          {displayValue(cmdeligne.designation)}
                        </TableCell>

                        <TableCell className="text-center font-medium">
                          {displayValue(cmdeligne.qteDEM)}
                        </TableCell>

                        <TableCell className="text-center font-medium">
                          {displayValue(cmdeligne.qteALL)}
                        </TableCell>

                        <TableCell className="text-center font-medium">
                          {displayValue(cmdeligne.qteRLQ)}
                        </TableCell>

                        <TableCell className="text-center font-medium">
                          {displayValue(cmdeligne.qteLIV)}
                        </TableCell>

                        <TableCell>
                          {cmdeligne.statut ? (
                            <span
                              className={cn(
                                "text-xs font-medium hover:none",
                                getCmdeMagasinStatusClass(cmdeligne.statut),
                              )}
                            >
                              {cmdeligne.statut}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          {displayValue(cmdeligne.dateStatut)}
                        </TableCell>

                        <TableCell>
                          {displayValue(cmdeligne.etaMaurice)}
                        </TableCell>

                        <TableCell>
                          {displayValue(cmdeligne.etaMagasin)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={14}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Aucune ligne de commande trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
