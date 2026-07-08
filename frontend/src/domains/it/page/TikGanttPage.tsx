import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GanttChartSquare } from "lucide-react";

import * as api from "../api/tikApi";
import type { Statut, Tik } from "../api/tikApi";

const STATUT_LABEL: Record<Statut, string> = {
  OUVERT: "Ouvert",
  PLANIFIE: "Planifié",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
  REFUSE: "Refusé",
  CLOTURE: "Clôturé",
  REOUVERT: "Réouvert",
  EN_ATTENTE: "En attente",
};

const STATUT_BAR_CLASSNAME: Record<Statut, string> = {
  OUVERT: "bg-blue-400",
  PLANIFIE: "bg-purple-500",
  EN_COURS: "bg-yellow-500",
  RESOLU: "bg-green-500",
  REFUSE: "bg-red-400",
  CLOTURE: "bg-gray-400",
  REOUVERT: "bg-orange-500",
  EN_ATTENTE: "bg-amber-500",
};

const DAY_WIDTH = 36;
const LABEL_WIDTH = 260;

function toDayStart(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00`);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

interface GanttRow {
  ticket: Tik;
  offset: number;
  duration: number;
}

function buildGantt(planifies: Tik[]) {
  const starts = planifies.map((t) => toDayStart(t.dateDebutPlanning!));
  const ends = planifies.map((t) => toDayStart(t.dateFinPlanning ?? t.dateDebutPlanning!));

  const rangeStart = addDays(new Date(Math.min(...starts.map((d) => d.getTime()))), -1);
  const rangeEnd = addDays(new Date(Math.max(...ends.map((d) => d.getTime()))), 1);
  const totalDays = diffDays(rangeStart, rangeEnd) + 1;

  const days = Array.from({ length: totalDays }, (_, i) => addDays(rangeStart, i));

  const rows: GanttRow[] = planifies.map((ticket) => {
    const start = toDayStart(ticket.dateDebutPlanning!);
    const end = toDayStart(ticket.dateFinPlanning ?? ticket.dateDebutPlanning!);
    return {
      ticket,
      offset: diffDays(rangeStart, start),
      duration: Math.max(1, diffDays(start, end) + 1),
    };
  });

  const today = toDayStart(new Date().toISOString());
  const todayOffset = today >= rangeStart && today <= rangeEnd ? diffDays(rangeStart, today) : -1;

  return { days, rows, todayOffset };
}

export default function TikGanttPage() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tik", "tickets"],
    queryFn: api.fetchTickets,
  });

  const planifies = useMemo(
    () =>
      tickets
        .filter((t) => t.dateDebutPlanning)
        .sort((a, b) => a.dateDebutPlanning!.localeCompare(b.dateDebutPlanning!)),
    [tickets],
  );

  const { days, rows, todayOffset } = useMemo(
    () => (planifies.length > 0 ? buildGantt(planifies) : { days: [] as Date[], rows: [] as GanttRow[], todayOffset: -1 }),
    [planifies],
  );

  const gridTemplateColumns = `${LABEL_WIDTH}px repeat(${days.length}, ${DAY_WIDTH}px)`;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <GanttChartSquare size={20} className="text-gray-500" /> Diagramme de Gantt — Tickets
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{rows.length} intervention(s) planifiée(s)</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-gray-400 py-12 border rounded-md">
          Aucun ticket planifié pour le moment.
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <div style={{ minWidth: LABEL_WIDTH + days.length * DAY_WIDTH }}>
            <div className="grid border-b" style={{ gridTemplateColumns }}>
              <div className="sticky left-0 z-20 bg-white px-3 py-2 text-xs font-semibold text-gray-500 border-r">
                Ticket
              </div>
              {days.map((day, i) => {
                const isToday = i === todayOffset;
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={day.toISOString()}
                    className={`px-1 py-2 text-[10px] text-center border-r last:border-r-0 ${
                      isToday
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : isWeekend
                          ? "bg-gray-50 text-gray-400"
                          : "text-gray-500"
                    }`}
                  >
                    <div>{day.toLocaleDateString("fr-FR", { day: "2-digit" })}</div>
                    <div className="uppercase">{day.toLocaleDateString("fr-FR", { month: "short" })}</div>
                  </div>
                );
              })}
            </div>

            {rows.map(({ ticket, offset, duration }) => (
              <div
                key={ticket.id}
                className="grid border-b last:border-b-0 hover:bg-gray-50"
                style={{ gridTemplateColumns }}
              >
                <Link
                  to={`/it/tickets/${ticket.id}`}
                  className="sticky left-0 z-10 bg-white px-3 py-2.5 border-r flex flex-col justify-center hover:bg-gray-50"
                >
                  <span className="text-xs font-mono text-gray-400">{ticket.numeroTicket}</span>
                  <span className="text-sm font-medium text-gray-800 truncate">{ticket.objetDemande}</span>
                  <span className="text-xs text-gray-400">
                    {ticket.intervenant ? `${ticket.intervenant.nom} ${ticket.intervenant.prenoms}` : "Non assigné"}
                  </span>
                </Link>
                <div className="relative py-2.5" style={{ gridColumn: `2 / span ${days.length}` }}>
                  <div
                    className={`h-5 rounded-md ${STATUT_BAR_CLASSNAME[ticket.statut]} flex items-center px-2 shadow-sm`}
                    style={{
                      marginLeft: `${offset * DAY_WIDTH}px`,
                      width: `${duration * DAY_WIDTH - 4}px`,
                    }}
                    title={`${STATUT_LABEL[ticket.statut]} — du ${ticket.dateDebutPlanning?.slice(0, 10)} au ${(
                      ticket.dateFinPlanning ?? ticket.dateDebutPlanning
                    )?.slice(0, 10)}`}
                  >
                    <span className="text-[10px] text-white font-medium truncate">{STATUT_LABEL[ticket.statut]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {(Object.keys(STATUT_LABEL) as Statut[]).map((statut) => (
          <div key={statut} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${STATUT_BAR_CLASSNAME[statut]}`} />
            {STATUT_LABEL[statut]}
          </div>
        ))}
      </div>
    </div>
  );
}
