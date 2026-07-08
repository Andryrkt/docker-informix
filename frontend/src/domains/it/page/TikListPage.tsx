import { useQuery } from "@tanstack/react-query";
import { ChevronRight, GanttChartSquare, Paperclip, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import * as api from "../api/tikApi";
import type { Statut } from "../api/tikApi";

const STATUT_CONFIG: Record<Statut, { label: string; className: string }> = {
  OUVERT:      { label: "Ouvert",      className: "bg-blue-50 text-blue-700" },
  PLANIFIE:    { label: "Planifié",    className: "bg-purple-50 text-purple-700" },
  EN_COURS:    { label: "En cours",    className: "bg-yellow-50 text-yellow-800" },
  RESOLU:      { label: "Résolu",      className: "bg-green-50 text-green-700" },
  REFUSE:      { label: "Refusé",      className: "bg-red-50 text-red-700" },
  CLOTURE:     { label: "Clôturé",     className: "bg-gray-100 text-gray-600" },
  REOUVERT:    { label: "Réouvert",    className: "bg-orange-50 text-orange-700" },
  EN_ATTENTE:  { label: "En attente",  className: "bg-amber-50 text-amber-700" },
};

const URGENCE_CLASSNAME: Record<string, string> = {
  P1: "bg-red-100 text-red-800",
  P2: "bg-orange-100 text-orange-800",
  P3: "bg-yellow-100 text-yellow-800",
  P4: "bg-gray-100 text-gray-600",
  P5: "bg-gray-100 text-gray-500",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TikListPage() {
  const navigate = useNavigate();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tik", "tickets"],
    queryFn: api.fetchTickets,
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tickets — Support IT</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tickets.length} ticket(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link to="/it/tickets/gantt">
              <GanttChartSquare size={15} /> Diagramme de Gantt
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link to="/it/demande-support-informatique">
              <Plus size={15} /> Nouveau ticket
            </Link>
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>N° Ticket</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Urgence</TableHead>
              <TableHead>Demandeur</TableHead>
              <TableHead>Intervenant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-8">Chargement...</TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-8">Aucun ticket.</TableCell>
              </TableRow>
            ) : tickets.map((t) => (
              <TableRow
                key={t.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/it/tickets/${t.id}`)}
              >
                <TableCell className="font-mono text-xs">{t.numeroTicket}</TableCell>
                <TableCell>
                  <div className="font-medium flex items-center gap-1.5">
                    {t.objetDemande}
                    {t.fichiers.length > 0 && (
                      <span title={`${t.fichiers.length} pièce(s) jointe(s)`}>
                        <Paperclip size={12} className="text-gray-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{fmtDate(t.createdAt)} — fin souhaitée {fmtDate(t.dateFinSouhaitee)}</div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {t.categorie?.description ?? "—"}
                  {t.sousCategorie && <div className="text-xs text-gray-400">{t.sousCategorie.description}</div>}
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${URGENCE_CLASSNAME[t.niveauUrgence]}`}>
                    {t.niveauUrgence}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {t.demandeur?.displayName ?? t.demandeur?.username ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {t.intervenant ? `${t.intervenant.nom} ${t.intervenant.prenoms}` : <span className="text-gray-300">—</span>}
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUT_CONFIG[t.statut].className}`}>
                    {STATUT_CONFIG[t.statut].label}
                  </span>
                </TableCell>
                <TableCell>
                  <ChevronRight size={14} className="text-gray-300" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
