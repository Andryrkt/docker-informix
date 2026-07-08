import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Ticket, Clock, AlertTriangle, Loader,
} from "lucide-react";

import * as api from "../api/tikApi";
import type { Statut, NiveauUrgence, Tik } from "../api/tikApi";

const STATUT_ORDER: Statut[] = [
  "OUVERT", "PLANIFIE", "EN_COURS", "EN_ATTENTE", "REOUVERT", "RESOLU", "CLOTURE", "REFUSE",
];

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

const URGENCE_ORDER: NiveauUrgence[] = ["P1", "P2", "P3", "P4", "P5"];

const URGENCE_BAR_CLASSNAME: Record<NiveauUrgence, string> = {
  P1: "bg-blue-900",
  P2: "bg-blue-700",
  P3: "bg-blue-500",
  P4: "bg-blue-300",
  P5: "bg-blue-200",
};

const TERMINAL_STATUTS: Statut[] = ["RESOLU", "CLOTURE", "REFUSE"];
const TREND_DAYS = 14;
const TOP_LIST_LIMIT = 6;

function toDayStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

interface BarRowProps {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  colorClassName: string;
}

function BarRow({ label, sublabel, value, max, colorClassName }: BarRowProps) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 shrink-0" title={label}>
        <div className="text-xs text-gray-700 truncate">{label}</div>
        {sublabel && <div className="text-[10px] text-gray-400 truncate">{sublabel}</div>}
      </div>
      <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm ${colorClassName}`}
          style={{ width: `${pct}%` }}
          title={`${label} : ${value}`}
        />
      </div>
      <div className="w-6 text-right text-xs font-medium text-gray-700 tabular-nums">{value}</div>
    </div>
  );
}

interface StatTileProps {
  icon: React.ElementType;
  label: string;
  value: number;
  tone?: "default" | "critical";
}

function StatTile({ icon: Icon, label, value, tone = "default" }: StatTileProps) {
  return (
    <div className="border rounded-md p-3 flex items-center gap-3">
      <div
        className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center ${
          tone === "critical" ? "bg-destructive/10 text-destructive" : "bg-gray-100 text-gray-500"
        }`}
      >
        <Icon size={16} />
      </div>
      <div>
        <div className={`text-lg font-semibold ${tone === "critical" ? "text-destructive" : "text-gray-800"}`}>
          {value}
        </div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

interface TrendPoint {
  day: Date;
  count: number;
}

function TrendChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 560;
  const height = 160;
  const max = Math.max(1, ...data.map((d) => d.count));

  const points = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * width : width / 2,
    y: height - 12 - (d.count / max) * (height - 24),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const segmentWidth = width / data.length;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <path d={areaPath} className="fill-blue-500/10" />
        <path d={linePath} fill="none" className="stroke-blue-500" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hoverIndex !== null && (
          <>
            <line
              x1={points[hoverIndex].x} x2={points[hoverIndex].x} y1={0} y2={height}
              className="stroke-gray-300" strokeWidth={1}
            />
            <circle
              cx={points[hoverIndex].x} cy={points[hoverIndex].y} r={4}
              className="fill-blue-500 stroke-white" strokeWidth={2}
            />
          </>
        )}
        {points.map((_, i) => (
          <rect
            key={i}
            x={i * segmentWidth}
            y={0}
            width={segmentWidth}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}
      </svg>
      {hoverIndex !== null && (
        <div
          className="absolute -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap"
          style={{
            left: `${(points[hoverIndex].x / width) * 100}%`,
            top: `${Math.max(points[hoverIndex].y / height * 100 - 14, 0)}%`,
          }}
        >
          {data[hoverIndex].day.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} — {data[hoverIndex].count} ticket(s)
        </div>
      )}
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{data[0].day.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
        <span>{data[data.length - 1].day.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
      </div>
    </div>
  );
}

function isEnRetard(ticket: Tik, today: Date): boolean {
  return !TERMINAL_STATUTS.includes(ticket.statut) && new Date(ticket.dateFinSouhaitee) < today;
}

export default function TikDashboardPage() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tik", "tickets"],
    queryFn: api.fetchTickets,
  });

  const stats = useMemo(() => {
    const today = toDayStart(new Date());
    const byStatut = new Map<Statut, number>();
    const byUrgence = new Map<NiveauUrgence, number>();
    const byCategorie = new Map<string, number>();
    const byIntervenant = new Map<string, number>();
    let enRetard = 0;

    for (const t of tickets) {
      byStatut.set(t.statut, (byStatut.get(t.statut) ?? 0) + 1);
      byUrgence.set(t.niveauUrgence, (byUrgence.get(t.niveauUrgence) ?? 0) + 1);
      byCategorie.set(t.categorie?.description ?? "Non catégorisé", (byCategorie.get(t.categorie?.description ?? "Non catégorisé") ?? 0) + 1);

      if (!TERMINAL_STATUTS.includes(t.statut)) {
        if (isEnRetard(t, today)) enRetard += 1;
        const intervenantLabel = t.intervenant ? `${t.intervenant.nom} ${t.intervenant.prenoms}` : "Non assigné";
        byIntervenant.set(intervenantLabel, (byIntervenant.get(intervenantLabel) ?? 0) + 1);
      }
    }

    return { byStatut, byUrgence, byCategorie, byIntervenant, enRetard };
  }, [tickets]);

  const trend = useMemo(() => {
    const today = toDayStart(new Date());
    const days = Array.from({ length: TREND_DAYS }, (_, i) => addDays(today, i - (TREND_DAYS - 1)));
    return days.map((day) => {
      const key = day.toISOString().slice(0, 10);
      const count = tickets.filter((t) => t.createdAt.slice(0, 10) === key).length;
      return { day, count };
    });
  }, [tickets]);

  const maxStatut = Math.max(1, ...STATUT_ORDER.map((s) => stats.byStatut.get(s) ?? 0));
  const maxUrgence = Math.max(1, ...URGENCE_ORDER.map((u) => stats.byUrgence.get(u) ?? 0));

  const topCategories = [...stats.byCategorie.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_LIST_LIMIT);
  const maxCategorie = Math.max(1, ...topCategories.map(([, count]) => count));

  const topIntervenants = [...stats.byIntervenant.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_LIST_LIMIT);
  const maxIntervenant = Math.max(1, ...topIntervenants.map(([, count]) => count));

  const enCours = stats.byStatut.get("EN_COURS") ?? 0;
  const ouverts = (stats.byStatut.get("OUVERT") ?? 0) + (stats.byStatut.get("REOUVERT") ?? 0);
  const enAttente = stats.byStatut.get("EN_ATTENTE") ?? 0;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-gray-500" /> Tableau de bord — Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{tickets.length} ticket(s) au total</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link to="/it/tickets" className="text-blue-600 hover:underline">Suivi des tickets</Link>
          <span className="text-gray-300">·</span>
          <Link to="/it/tickets/gantt" className="text-blue-600 hover:underline">Diagramme de Gantt</Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile icon={Ticket} label="À traiter" value={ouverts} />
            <StatTile icon={Loader} label="En cours" value={enCours} />
            <StatTile icon={Clock} label="En attente" value={enAttente} />
            <StatTile icon={AlertTriangle} label="En retard" value={stats.enRetard} tone="critical" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Répartition par statut</h2>
              <div className="space-y-2.5">
                {STATUT_ORDER.filter((s) => (stats.byStatut.get(s) ?? 0) > 0).map((statut) => (
                  <BarRow
                    key={statut}
                    label={STATUT_LABEL[statut]}
                    value={stats.byStatut.get(statut) ?? 0}
                    max={maxStatut}
                    colorClassName={STATUT_BAR_CLASSNAME[statut]}
                  />
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Répartition par urgence</h2>
              <div className="space-y-2.5">
                {URGENCE_ORDER.map((urgence) => (
                  <BarRow
                    key={urgence}
                    label={urgence}
                    value={stats.byUrgence.get(urgence) ?? 0}
                    max={maxUrgence}
                    colorClassName={URGENCE_BAR_CLASSNAME[urgence]}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Tickets créés — {TREND_DAYS} derniers jours</h2>
            <TrendChart data={trend} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Top catégories</h2>
              {topCategories.length === 0 ? (
                <p className="text-xs text-gray-400">Aucune donnée.</p>
              ) : (
                <div className="space-y-2.5">
                  {topCategories.map(([label, count]) => (
                    <BarRow key={label} label={label} value={count} max={maxCategorie} colorClassName="bg-blue-500" />
                  ))}
                </div>
              )}
            </div>

            <div className="border rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Charge par intervenant (tickets actifs)</h2>
              {topIntervenants.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun ticket actif assigné.</p>
              ) : (
                <div className="space-y-2.5">
                  {topIntervenants.map(([label, count]) => (
                    <BarRow key={label} label={label} value={count} max={maxIntervenant} colorClassName="bg-blue-500" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
