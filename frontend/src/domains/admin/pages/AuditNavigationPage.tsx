import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Globe,
  Search,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchNavigationLogs } from "@/domains/audit/api/auditApi";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavLog {
  id: number;
  userId: number | null;
  username: string | null;
  companyCode: string | null;
  sessionId: string | null;
  pageUrl: string;
  pageTitle: string | null;
  actionAttempted: string | null;
  actionResult: string | null;
  searchData: Record<string, unknown> | null;
  errorCode: number | null;
  errorMessage: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  refererUrl: string | null;
  createdAt: string;
}

// ── Helpers visuels ───────────────────────────────────────────────────────────

const RESULT_CONFIG: Record<string, { label: string; className: string }> = {
  VISITED:        { label: "Visite",     className: "bg-blue-50 text-blue-700" },
  SEARCHED:       { label: "Recherche",  className: "bg-purple-50 text-purple-700" },
  ATTEMPTED:      { label: "Tentative",  className: "bg-yellow-50 text-yellow-800" },
  CANCELLED:      { label: "Annulation", className: "bg-gray-100 text-gray-600" },
  ERROR_REDIRECT: { label: "Erreur",     className: "bg-red-50 text-red-700" },
};

function ResultBadge({ result }: { result: string | null }) {
  if (!result) return <span className="text-gray-300">—</span>;
  const cfg = RESULT_CONFIG[result] ?? { label: result, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function ErrorCodeBadge({ code }: { code: number | null }) {
  if (!code) return <span className="text-gray-300">—</span>;
  const color =
    code >= 500 ? "bg-red-100 text-red-800" :
    code >= 400 ? "bg-orange-100 text-orange-800" :
    "bg-gray-100 text-gray-600";
  return <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${color}`}>{code}</span>;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ── Ligne extensible ──────────────────────────────────────────────────────────

function NavRow({ log }: { log: NavLog }) {
  const [open, setOpen] = useState(false);

  const hasDetail =
    log.searchData || log.errorMessage || log.userAgent || log.refererUrl;

  return (
    <>
      <TableRow
        className={`cursor-pointer hover:bg-gray-50 ${open ? "bg-gray-50" : ""}`}
        onClick={() => hasDetail && setOpen((o) => !o)}
      >
        <TableCell className="w-6 text-gray-400">
          {hasDetail ? (
            open ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </TableCell>
        <TableCell className="text-xs text-gray-500 whitespace-nowrap">{fmtDate(log.createdAt)}</TableCell>
        <TableCell>
          {log.username ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shrink-0">
                {log.username.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium">{log.username}</span>
            </span>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </TableCell>
        <TableCell>
          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
            {log.companyCode ?? "—"}
          </span>
        </TableCell>
        <TableCell className="max-w-64">
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-gray-400 shrink-0" />
            <span className="text-sm font-mono truncate text-gray-700" title={log.pageUrl}>
              {log.pageUrl}
            </span>
          </div>
          {log.pageTitle && (
            <div className="text-xs text-gray-400 mt-0.5">{log.pageTitle}</div>
          )}
        </TableCell>
        <TableCell>
          {log.actionAttempted ? (
            <span className="text-xs font-mono bg-yellow-50 text-yellow-800 px-1.5 py-0.5 rounded">
              {log.actionAttempted}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </TableCell>
        <TableCell><ResultBadge result={log.actionResult} /></TableCell>
        <TableCell><ErrorCodeBadge code={log.errorCode} /></TableCell>
      </TableRow>

      {open && hasDetail && (
        <TableRow className="bg-gray-50 border-b">
          <TableCell colSpan={8} className="py-3 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {log.searchData && Object.keys(log.searchData).length > 0 && (
                <DetailBlock title="Données de recherche" icon="🔍">
                  <JsonTable data={log.searchData} />
                </DetailBlock>
              )}
              {log.errorMessage && (
                <DetailBlock title="Message d'erreur" icon="⚠️">
                  <p className="text-red-700 bg-red-50 rounded p-2 font-mono text-xs break-words">
                    {log.errorMessage}
                  </p>
                </DetailBlock>
              )}
              {log.refererUrl && (
                <DetailBlock title="Page précédente" icon="↩️">
                  <span className="font-mono text-gray-600">{log.refererUrl}</span>
                </DetailBlock>
              )}
              {log.userAgent && (
                <DetailBlock title="User-Agent" icon="💻">
                  <span className="text-gray-500 break-all">{log.userAgent}</span>
                </DetailBlock>
              )}
              {log.ipAddress && (
                <DetailBlock title="Adresse IP" icon="🌐">
                  <span className="font-mono text-gray-600">{log.ipAddress}</span>
                </DetailBlock>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ── Composants utilitaires ────────────────────────────────────────────────────

function DetailBlock({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-gray-500 font-semibold flex items-center gap-1">
        <span>{icon}</span> {title}
      </p>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

function JsonTable({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="rounded border overflow-hidden">
      <table className="w-full text-xs">
        <tbody>
          {Object.entries(data).map(([k, v]) => (
            <tr key={k} className="border-b last:border-0">
              <td className="py-1 px-2 bg-gray-100 font-mono text-gray-600 w-1/3">{k}</td>
              <td className="py-1 px-2 text-gray-700">{String(v ?? "")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

type FilterResult = "ALL" | "VISITED" | "SEARCHED" | "ATTEMPTED" | "CANCELLED" | "ERROR_REDIRECT";

export default function AuditNavigationPage() {
  const [search, setSearch]           = useState("");
  const [filterResult, setFilterResult] = useState<FilterResult>("ALL");
  const [limit, setLimit]             = useState(100);

  const { data: logs = [], isLoading, refetch } = useQuery<NavLog[]>({
    queryKey: ["audit", "navigation", limit, filterResult],
    queryFn: () =>
      fetchNavigationLogs({
        limit,
        errorsOnly: filterResult === "ERROR_REDIRECT",
      }),
  });

  const filtered = logs.filter((l) => {
    const matchResult = filterResult === "ALL" || l.actionResult === filterResult;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.username?.toLowerCase().includes(q) ||
      l.pageUrl.toLowerCase().includes(q) ||
      l.pageTitle?.toLowerCase().includes(q) ||
      String(l.errorCode ?? "").includes(q);
    return matchResult && matchSearch;
  });

  const stats = {
    total:     logs.length,
    erreurs:   logs.filter((l) => l.actionResult === "ERROR_REDIRECT").length,
    recherches: logs.filter((l) => l.actionResult === "SEARCHED").length,
    annulations: logs.filter((l) => l.actionResult === "CANCELLED").length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Historique Navigation</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Passages dans les pages, recherches, tentatives et erreurs
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Actualiser
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Événements" value={stats.total} icon={<Globe size={16} className="text-blue-500" />} color="blue" />
        <StatCard label="Erreurs"    value={stats.erreurs} icon={<XCircle size={16} className="text-red-500" />} color="red" />
        <StatCard label="Recherches" value={stats.recherches} icon={<Search size={16} className="text-purple-500" />} color="purple" />
        <StatCard label="Annulations" value={stats.annulations} icon={<AlertTriangle size={16} className="text-yellow-600" />} color="yellow" />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Filtrer par utilisateur, page, code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {(["ALL", "VISITED", "SEARCHED", "ATTEMPTED", "CANCELLED", "ERROR_REDIRECT"] as FilterResult[]).map((r) => (
            <button
              key={r}
              onClick={() => setFilterResult(r)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                filterResult === r
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {r === "ALL" ? "Tout" : (RESULT_CONFIG[r]?.label ?? r)}
            </button>
          ))}
        </div>

        <select
          className="h-8 text-xs rounded border border-gray-200 px-2 bg-white text-gray-600"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={50}>50 derniers</option>
          <option value={100}>100 derniers</option>
          <option value={200}>200 derniers</option>
          <option value={500}>500 derniers</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-6" />
              <TableHead>Date / Heure</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Société</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Résultat</TableHead>
              <TableHead>Code HTTP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                  Chargement…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                  Aucun événement trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => <NavRow key={log.id} log={log} />)
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-gray-400 text-right">
        {filtered.length} / {logs.length} événement(s) affiché(s) — cliquez sur une ligne pour voir les détails
      </p>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "red" | "purple" | "yellow" | "green";
}) {
  const bg: Record<string, string> = {
    blue:   "bg-blue-50 border-blue-100",
    red:    "bg-red-50 border-red-100",
    purple: "bg-purple-50 border-purple-100",
    yellow: "bg-yellow-50 border-yellow-100",
    green:  "bg-green-50 border-green-100",
  };
  return (
    <div className={`border rounded-md p-3 ${bg[color]}`}>
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
