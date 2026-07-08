import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, GanttChartSquare } from "lucide-react";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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

type ViewMode = "semaine" | "mois" | "annee";

const VIEW_MODES: ViewMode[] = ["semaine", "mois", "annee"];

const VIEW_MODE_CONFIG: Record<ViewMode, { label: string; dayWidth: number; showDayLabels: boolean }> = {
  semaine: { label: "Semaine", dayWidth: 64, showDayLabels: true },
  mois: { label: "Mois", dayWidth: 28, showDayLabels: true },
  annee: { label: "Année", dayWidth: 4, showDayLabels: false },
};

const LABEL_WIDTH = 260;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toDayStart(value: Date | string): Date {
  const d = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00`) : new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function startOfWeek(date: Date): Date {
  const d = toDayStart(date);
  const offsetFromMonday = (d.getDay() + 6) % 7;
  return addDays(d, -offsetFromMonday);
}

function startOfMonth(date: Date): Date {
  return toDayStart(new Date(date.getFullYear(), date.getMonth(), 1));
}

function endOfMonth(date: Date): Date {
  return toDayStart(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function startOfYear(date: Date): Date {
  return toDayStart(new Date(date.getFullYear(), 0, 1));
}

function endOfYear(date: Date): Date {
  return toDayStart(new Date(date.getFullYear(), 11, 31));
}

function getRange(mode: ViewMode, anchor: Date): { start: Date; end: Date } {
  if (mode === "semaine") {
    const start = startOfWeek(anchor);
    return { start, end: addDays(start, 6) };
  }
  if (mode === "mois") {
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }
  return { start: startOfYear(anchor), end: endOfYear(anchor) };
}

function shiftAnchor(mode: ViewMode, anchor: Date, dir: 1 | -1): Date {
  if (mode === "semaine") return addDays(anchor, 7 * dir);
  if (mode === "mois") return addMonths(anchor, dir);
  return addYears(anchor, dir);
}

function formatRangeLabel(mode: ViewMode, anchor: Date, start: Date, end: Date): string {
  if (mode === "semaine") {
    const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    return `Semaine du ${fmt(start)} au ${fmt(end)}`;
  }
  if (mode === "mois") {
    return capitalize(anchor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
  }
  return `${anchor.getFullYear()}`;
}

interface GanttRow {
  ticket: Tik;
  offset: number;
  duration: number;
  clippedStart: boolean;
  clippedEnd: boolean;
}

function buildRows(tickets: Tik[], rangeStart: Date, rangeEnd: Date): GanttRow[] {
  const rows: GanttRow[] = [];
  for (const ticket of tickets) {
    if (!ticket.dateDebutPlanning) continue;
    const start = toDayStart(ticket.dateDebutPlanning);
    const end = toDayStart(ticket.dateFinPlanning ?? ticket.dateDebutPlanning);
    if (end < rangeStart || start > rangeEnd) continue;

    const visibleStart = start < rangeStart ? rangeStart : start;
    const visibleEnd = end > rangeEnd ? rangeEnd : end;

    rows.push({
      ticket,
      offset: diffDays(rangeStart, visibleStart),
      duration: Math.max(1, diffDays(visibleStart, visibleEnd) + 1),
      clippedStart: start < rangeStart,
      clippedEnd: end > rangeEnd,
    });
  }
  return rows.sort((a, b) => a.offset - b.offset);
}

interface MonthGroup {
  key: string;
  label: string;
  span: number;
}

function buildMonthGroups(days: Date[], mode: ViewMode): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const day of days) {
    const key = `${day.getFullYear()}-${day.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.span += 1;
      continue;
    }
    const label = mode === "mois"
      ? capitalize(day.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }))
      : capitalize(day.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""));
    groups.push({ key, label, span: 1 });
  }
  return groups;
}

const UNASSIGNED_FILTER = "__unassigned__";
const ALL_INTERVENANTS_FILTER = "__all__";

export default function TikGanttPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("mois");
  const [anchor, setAnchor] = useState<Date>(() => toDayStart(new Date()));
  const [intervenantFilter, setIntervenantFilter] = useState<string>(ALL_INTERVENANTS_FILTER);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tik", "tickets"],
    queryFn: api.fetchTickets,
  });

  const intervenantOptions = useMemo(() => {
    const byId = new Map<number, string>();
    let hasUnassigned = false;
    for (const t of tickets) {
      if (!t.dateDebutPlanning) continue;
      if (t.intervenant) {
        byId.set(t.intervenant.id, `${t.intervenant.nom} ${t.intervenant.prenoms}`);
      } else {
        hasUnassigned = true;
      }
    }
    return {
      list: [...byId.entries()].sort((a, b) => a[1].localeCompare(b[1])),
      hasUnassigned,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (intervenantFilter === ALL_INTERVENANTS_FILTER) return tickets;
    if (intervenantFilter === UNASSIGNED_FILTER) return tickets.filter((t) => !t.intervenant);
    const id = Number(intervenantFilter);
    return tickets.filter((t) => t.intervenant?.id === id);
  }, [tickets, intervenantFilter]);

  const { start: rangeStart, end: rangeEnd } = useMemo(() => getRange(viewMode, anchor), [viewMode, anchor]);

  const days = useMemo(() => {
    const total = diffDays(rangeStart, rangeEnd) + 1;
    return Array.from({ length: total }, (_, i) => addDays(rangeStart, i));
  }, [rangeStart, rangeEnd]);

  const rows = useMemo(() => buildRows(filteredTickets, rangeStart, rangeEnd), [filteredTickets, rangeStart, rangeEnd]);
  const monthGroups = useMemo(() => buildMonthGroups(days, viewMode), [days, viewMode]);

  const dayWidth = VIEW_MODE_CONFIG[viewMode].dayWidth;
  const showDayLabels = VIEW_MODE_CONFIG[viewMode].showDayLabels;
  const gridTemplateColumns = `${LABEL_WIDTH}px repeat(${days.length}, ${dayWidth}px)`;

  const today = toDayStart(new Date());
  const todayOffset = today >= rangeStart && today <= rangeEnd ? diffDays(rangeStart, today) : -1;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <GanttChartSquare size={20} className="text-gray-500" /> Diagramme de Gantt — Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} intervention(s) affichée(s)</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={intervenantFilter} onValueChange={setIntervenantFilter}>
            <SelectTrigger size="sm" className="w-48">
              <SelectValue placeholder="Intervenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_INTERVENANTS_FILTER}>Tous les intervenants</SelectItem>
              {intervenantOptions.hasUnassigned && (
                <SelectItem value={UNASSIGNED_FILTER}>Non assigné</SelectItem>
              )}
              {intervenantOptions.list.map(([id, label]) => (
                <SelectItem key={id} value={String(id)}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-md overflow-hidden">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {VIEW_MODE_CONFIG[mode].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAnchor((a) => shiftAnchor(viewMode, a, -1))}
              className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-600"
              aria-label="Période précédente"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setAnchor(toDayStart(new Date()))}
              className="px-2.5 py-1.5 text-xs border rounded-md hover:bg-gray-50 text-gray-600"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setAnchor((a) => shiftAnchor(viewMode, a, 1))}
              className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-600"
              aria-label="Période suivante"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-700">{formatRangeLabel(viewMode, anchor, rangeStart, rangeEnd)}</p>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-gray-400 py-12 border rounded-md">
          Aucun ticket planifié sur cette période.
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <div style={{ minWidth: LABEL_WIDTH + days.length * dayWidth }}>
            <div className="flex border-b">
              <div className="sticky left-0 z-20 bg-white shrink-0 border-r px-3 py-2 flex items-center" style={{ width: LABEL_WIDTH }}>
                <span className="text-xs font-semibold text-gray-500">Ticket</span>
              </div>
              {monthGroups.map((group) => (
                <div
                  key={group.key}
                  className="shrink-0 text-center text-xs font-semibold text-gray-600 py-2 border-r last:border-r-0"
                  style={{ width: group.span * dayWidth }}
                >
                  {group.label}
                </div>
              ))}
            </div>

            {showDayLabels && (
              <div className="grid border-b" style={{ gridTemplateColumns }}>
                <div className="sticky left-0 z-20 bg-white border-r" />
                {days.map((day, i) => {
                  const isToday = i === todayOffset;
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={day.toISOString()}
                      className={`px-1 py-1.5 text-[10px] text-center border-r last:border-r-0 ${
                        isToday
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : isWeekend
                            ? "bg-gray-50 text-gray-400"
                            : "text-gray-500"
                      }`}
                    >
                      {viewMode === "semaine" && (
                        <div className="capitalize">{day.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                      )}
                      <div>{day.toLocaleDateString("fr-FR", { day: "2-digit" })}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {rows.map(({ ticket, offset, duration, clippedStart, clippedEnd }) => (
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
                    className={`h-5 ${STATUT_BAR_CLASSNAME[ticket.statut]} flex items-center px-2 shadow-sm ${
                      clippedStart ? "" : "rounded-l-md"
                    } ${clippedEnd ? "" : "rounded-r-md"}`}
                    style={{
                      marginLeft: `${offset * dayWidth}px`,
                      width: `${duration * dayWidth - (clippedEnd ? 0 : 4)}px`,
                    }}
                    title={`${STATUT_LABEL[ticket.statut]} — du ${ticket.dateDebutPlanning?.slice(0, 10)} au ${(
                      ticket.dateFinPlanning ?? ticket.dateDebutPlanning
                    )?.slice(0, 10)}`}
                  >
                    {dayWidth >= 12 && (
                      <span className="text-[10px] text-white font-medium truncate">{STATUT_LABEL[ticket.statut]}</span>
                    )}
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
