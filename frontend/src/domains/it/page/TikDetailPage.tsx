import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Ban, CalendarClock, CheckCircle2, Clock, Paperclip,
  RotateCcw, ShieldCheck, UserCog, XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import TikActionDialog from "../components/TikActionDialog";
import type { TikActionKind } from "../components/TikActionDialog";
import TikDiscussion from "../components/TikDiscussion";
import * as api from "../api/tikApi";
import type { Statut } from "../api/tikApi";

const STATUT_CONFIG: Record<Statut, { label: string; className: string }> = {
  OUVERT:      { label: "Ouvert",      className: "bg-blue-50 text-blue-700" },
  EN_COURS:    { label: "En cours",    className: "bg-yellow-50 text-yellow-800" },
  PLANIFIE:    { label: "Planifié",    className: "bg-purple-50 text-purple-700" },
  RESOLU:      { label: "Résolu",      className: "bg-green-50 text-green-700" },
  REFUSE:      { label: "Refusé",      className: "bg-red-50 text-red-700" },
  CLOTURE:     { label: "Clôturé",     className: "bg-gray-100 text-gray-600" },
  REOUVERT:    { label: "Réouvert",    className: "bg-orange-50 text-orange-700" },
  EN_ATTENTE:  { label: "En attente",  className: "bg-amber-50 text-amber-700" },
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{value ?? "—"}</p>
    </div>
  );
}

export default function TikDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tikId = Number(id);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["tik", "tickets", tikId],
    queryFn: () => api.fetchTicket(tikId),
    enabled: !!tikId,
  });

  const { data: historique = [] } = useQuery({
    queryKey: ["tik", "historique", tikId],
    queryFn: () => api.fetchHistorique(tikId),
    enabled: !!tikId,
  });

  const [action, setAction] = useState<TikActionKind | null>(null);

  if (isLoading) return <div className="p-6 text-gray-400">Chargement…</div>;
  if (!ticket) return <div className="p-6 text-gray-400">Ticket introuvable.</div>;

  const a = ticket.actions;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/it/tickets"><ArrowLeft size={15} /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {ticket.numeroTicket}
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUT_CONFIG[ticket.statut].className}`}>
                {STATUT_CONFIG[ticket.statut].label}
              </span>
            </h1>
            <p className="text-sm text-gray-500">{ticket.objetDemande}</p>
          </div>
        </div>
      </div>

      {/* Actions disponibles */}
      <div className="flex flex-wrap gap-2 border rounded-md p-3 bg-gray-50">
        {a.peutValider && (
          <Button size="sm" className="gap-1.5" onClick={() => setAction("valider")}>
            <CheckCircle2 size={14} /> Valider
          </Button>
        )}
        {a.peutRefuser && (
          <Button size="sm" variant="outline" className="gap-1.5 text-red-600 border-red-200" onClick={() => setAction("refuser")}>
            <XCircle size={14} /> Refuser
          </Button>
        )}
        {a.peutMettreEnAttente && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAction("mettreEnAttente")}>
            <Clock size={14} /> Mettre en attente
          </Button>
        )}
        {a.peutPlanifier && (
          <Button size="sm" className="gap-1.5" onClick={() => setAction("planifier")}>
            <CalendarClock size={14} /> Planifier
          </Button>
        )}
        {a.peutTransferer && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAction("transferer")}>
            <UserCog size={14} /> Transférer
          </Button>
        )}
        {a.peutResoudre && (
          <Button size="sm" className="gap-1.5" onClick={() => setAction("resoudre")}>
            <CheckCircle2 size={14} /> Résoudre
          </Button>
        )}
        {a.peutCloturer && (
          <Button size="sm" className="gap-1.5" onClick={() => setAction("cloturer")}>
            <ShieldCheck size={14} /> Clôturer
          </Button>
        )}
        {a.peutReouvrir && (
          <Button size="sm" variant="outline" className="gap-1.5 text-orange-600 border-orange-200" onClick={() => setAction("reouvrir")}>
            <RotateCcw size={14} /> Réouvrir
          </Button>
        )}
        {!Object.values(a).some(Boolean) && (
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <Ban size={13} /> Aucune action disponible pour vous sur ce ticket.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-md p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Demande</h2>
            <div
              className="text-sm text-gray-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{ __html: ticket.detailDemande }}
            />
          </div>

          <div className="border rounded-md p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Historique</h2>
            <ol className="space-y-3">
              {historique.map((h) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded h-fit ${STATUT_CONFIG[h.statut]?.className ?? "bg-gray-100"}`}>
                    {STATUT_CONFIG[h.statut]?.label ?? h.statut}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      {fmtDate(h.createdAt)} — {h.user?.displayName ?? "—"}
                    </p>
                    {h.commentaire && <p className="text-gray-700 mt-0.5">{h.commentaire}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <TikDiscussion ticketId={ticket.id} canComment={ticket.actions.peutCommenter} />
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <div className="border rounded-md p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Ticket</h2>
            <Info label="Catégorie" value={ticket.categorie?.description} />
            <Info label="Sous-catégorie" value={ticket.sousCategorie?.description} />
            <Info label="Niveau d'urgence" value={ticket.niveauUrgence} />
            <Info label="Parc informatique" value={ticket.parcInformatique} />
            <Info label="Date de fin souhaitée" value={fmtDate(ticket.dateFinSouhaitee)} />
            <Info label="Créé le" value={fmtDate(ticket.createdAt)} />
          </div>

          <div className="border rounded-md p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Personnes</h2>
            <Info label="Demandeur" value={ticket.demandeur?.displayName ?? ticket.demandeur?.username} />
            <Info label="Validateur" value={ticket.validateur?.displayName} />
            <Info label="Intervenant" value={ticket.intervenant ? `${ticket.intervenant.nom} ${ticket.intervenant.prenoms}` : null} />
          </div>

          <div className="border rounded-md p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Agence / Service</h2>
            <Info label="Émetteur" value={ticket.agenceEmetteur ? `${ticket.agenceEmetteur.code} / ${ticket.serviceEmetteur?.code ?? "—"}` : null} />
            <Info label="Débiteur" value={ticket.agenceDebiteur ? `${ticket.agenceDebiteur.code} / ${ticket.serviceDebiteur?.code ?? "—"}` : null} />
          </div>

          {(ticket.dateDebutPlanning || ticket.dateFinPlanning) && (
            <div className="border rounded-md p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Planning</h2>
              <Info label="Début" value={fmtDate(ticket.dateDebutPlanning)} />
              <Info label="Fin" value={fmtDate(ticket.dateFinPlanning)} />
            </div>
          )}

          <div className="border rounded-md p-4 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Paperclip size={13} /> Pièces jointes
            </h2>
            {ticket.fichiers.length === 0 ? (
              <p className="text-xs text-gray-400">Aucune pièce jointe.</p>
            ) : (
              <ul className="space-y-1">
                {ticket.fichiers.map((f, i) => (
                  <li key={i}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {f.name} <span className="text-gray-400">({f.sizeKb} Ko)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <TikActionDialog ticket={ticket} action={action} onClose={() => setAction(null)} />
    </div>
  );
}
