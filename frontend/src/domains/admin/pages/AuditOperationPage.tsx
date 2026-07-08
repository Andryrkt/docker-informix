import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  RefreshCw,
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
import {
  fetchOperationLogs,
  type DocumentType,
  type OperationType,
} from "@/domains/audit/api/auditApi";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConstraintViolation { field: string; message: string; }
interface FileOp { type: string; fileName: string; path?: string; success: boolean; error?: string; }

interface OpLog {
  id: number;
  userId: number | null;
  username: string | null;
  companyCode: string | null;
  operationType: string;
  documentType: string | null;
  documentId: string | null;
  documentNumber: string | null;
  isSuccess: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  errorCode: string | null;
  submittedData: Record<string, unknown> | null;
  constraintsViolated: ConstraintViolation[] | null;
  fileOperations: FileOp[] | null;
  pageUrl: string | null;
  durationMs: number | null;
  ipAddress: string | null;
  createdAt: string;
}

// ── Configs visuelles ──────────────────────────────────────────────────────────

const OP_CONFIG: Record<string, { label: string; className: string }> = {
  SOUMISSION:   { label: "Soumission",   className: "bg-blue-50 text-blue-800" },
  VALIDATION:   { label: "Validation",   className: "bg-green-50 text-green-800" },
  MODIFICATION: { label: "Modification", className: "bg-yellow-50 text-yellow-800" },
  SUPPRESSION:  { label: "Suppression",  className: "bg-red-50 text-red-800" },
  CREATION:     { label: "Création",     className: "bg-teal-50 text-teal-800" },
  CLOTUR:       { label: "Clôture",      className: "bg-gray-100 text-gray-700" },
  FILE_MERGE:   { label: "Fusion",       className: "bg-indigo-50 text-indigo-800" },
  DB_SAV:       { label: "Sauvegarde BD",className: "bg-purple-50 text-purple-800" },
  DW_COP:       { label: "DocuWare",     className: "bg-orange-50 text-orange-800" },
  FILE_UPLOAD:  { label: "Upload",       className: "bg-cyan-50 text-cyan-800" },
  ANNULATION:   { label: "Annulation",   className: "bg-gray-100 text-gray-600" },
};

const DOC_LABELS: Record<string, string> = {
  DIT: "Demande Intervention", OR: "Ordre Réparation", FAC: "Facture",
  RI: "Rapport Intervention", TIK: "Support IT", DA: "Demande Appro.",
  DOM: "Ordre Mission", BDM: "Mouvement Matériel", CAS: "Casier",
  CDE: "Commande", DEV: "Devis", BC: "Bon de Commande",
  AC: "Accusé Réception", CDEFRN: "Cde Fournisseur", SW: "Swift", MUT: "Mutation",
};

function OpTypeBadge({ type }: { type: string }) {
  const cfg = OP_CONFIG[type] ?? { label: type, className: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${cfg.className}`}>{cfg.label}</span>;
}

function DocBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded" title={DOC_LABELS[type] ?? type}>
      {type}
    </span>
  );
}

function SuccessBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded w-fit">
      <CheckCircle2 size={11} /> Succès
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded w-fit">
      <XCircle size={11} /> Échec
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ── Ligne extensible ──────────────────────────────────────────────────────────

function OpRow({ log }: { log: OpLog }) {
  const [open, setOpen] = useState(false);

  const hasDetail =
    log.submittedData ||
    log.constraintsViolated?.length ||
    log.fileOperations?.length ||
    log.errorMessage ||
    log.errorCode;

  return (
    <>
      <TableRow
        className={`cursor-pointer hover:bg-gray-50 ${open ? "bg-gray-50" : ""}`}
        onClick={() => hasDetail && setOpen((o) => !o)}
      >
        <TableCell className="w-6 text-gray-400">
          {hasDetail
            ? open
              ? <ChevronDown size={14} />
              : <ChevronRight size={14} />
            : null}
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
          ) : <span className="text-gray-300 text-xs">—</span>}
        </TableCell>
        <TableCell>
          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
            {log.companyCode ?? "—"}
          </span>
        </TableCell>
        <TableCell><OpTypeBadge type={log.operationType} /></TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            <DocBadge type={log.documentType} />
            {log.documentNumber && (
              <span className="text-xs text-gray-600 font-mono">{log.documentNumber}</span>
            )}
          </div>
        </TableCell>
        <TableCell><SuccessBadge ok={log.isSuccess} /></TableCell>
        <TableCell className="max-w-56">
          <span className="text-sm text-gray-600 truncate block" title={log.isSuccess ? (log.successMessage ?? "") : (log.errorMessage ?? "")}>
            {log.isSuccess
              ? (log.successMessage ?? <span className="text-gray-300">—</span>)
              : (log.errorMessage ?? log.errorCode ?? <span className="text-gray-300">—</span>)
            }
          </span>
        </TableCell>
        <TableCell className="text-xs text-gray-400 text-right">
          {log.durationMs != null ? `${log.durationMs} ms` : "—"}
        </TableCell>
      </TableRow>

      {open && hasDetail && (
        <TableRow className="bg-gray-50 border-b">
          <TableCell colSpan={9} className="py-4 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">

              {/* Contraintes violées */}
              {log.constraintsViolated && log.constraintsViolated.length > 0 && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-gray-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={13} className="text-orange-500" /> Contraintes métier violées
                  </p>
                  <div className="rounded border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-orange-50 border-b">
                          <th className="text-left py-1.5 px-3 font-semibold text-orange-800">Champ</th>
                          <th className="text-left py-1.5 px-3 font-semibold text-orange-800">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.constraintsViolated.map((c, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-1.5 px-3 font-mono text-gray-600 bg-gray-50">{c.field}</td>
                            <td className="py-1.5 px-3 text-red-700">{c.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Opérations fichier */}
              {log.fileOperations && log.fileOperations.length > 0 && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-gray-500 font-semibold flex items-center gap-1">
                    <FileText size={13} className="text-blue-500" /> Opérations fichier
                  </p>
                  <div className="rounded border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-blue-50 border-b">
                          <th className="text-left py-1.5 px-3 font-semibold text-blue-800">Type</th>
                          <th className="text-left py-1.5 px-3 font-semibold text-blue-800">Fichier</th>
                          <th className="text-left py-1.5 px-3 font-semibold text-blue-800">Chemin</th>
                          <th className="text-left py-1.5 px-3 font-semibold text-blue-800">Résultat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.fileOperations.map((f, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-1.5 px-3 font-mono bg-gray-50 text-gray-600">{f.type}</td>
                            <td className="py-1.5 px-3 font-mono">{f.fileName}</td>
                            <td className="py-1.5 px-3 text-gray-500">{f.path ?? "—"}</td>
                            <td className="py-1.5 px-3">
                              {f.success
                                ? <span className="text-green-700 flex items-center gap-1"><CheckCircle2 size={11} /> OK</span>
                                : <span className="text-red-700 flex items-center gap-1"><XCircle size={11} /> {f.error ?? "Échec"}</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Message d'erreur */}
              {!log.isSuccess && log.errorMessage && (
                <div className="space-y-1">
                  <p className="text-gray-500 font-semibold flex items-center gap-1">
                    <XCircle size={13} className="text-red-500" /> Erreur
                    {log.errorCode && (
                      <span className="font-mono bg-red-100 text-red-700 px-1.5 rounded ml-1">{log.errorCode}</span>
                    )}
                  </p>
                  <p className="text-red-700 bg-red-50 rounded p-2 font-mono break-words">{log.errorMessage}</p>
                </div>
              )}

              {/* Données soumises */}
              {log.submittedData && Object.keys(log.submittedData).length > 0 && (
                <div className="space-y-1">
                  <p className="text-gray-500 font-semibold">📋 Données soumises</p>
                  <div className="rounded border overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.entries(log.submittedData).map(([k, v]) => (
                          <tr key={k} className="border-b last:border-0">
                            <td className="py-1 px-2 bg-gray-100 font-mono text-gray-600 w-1/3">{k}</td>
                            <td className="py-1 px-2 text-gray-700 break-words">
                              {typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Métadonnées */}
              <div className="space-y-1 text-gray-400">
                <p className="font-semibold text-gray-500">ℹ️ Contexte</p>
                <div className="grid grid-cols-2 gap-1">
                  <span>Page :</span><span className="font-mono truncate">{log.pageUrl ?? "—"}</span>
                  <span>IP :</span><span className="font-mono">{log.ipAddress ?? "—"}</span>
                  <span>Durée :</span><span>{log.durationMs != null ? `${log.durationMs} ms` : "—"}</span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

const ALL_OP_TYPES: OperationType[] = [
  "SOUMISSION", "VALIDATION", "MODIFICATION", "SUPPRESSION",
  "CREATION", "CLOTUR", "FILE_MERGE", "DB_SAV", "DW_COP", "FILE_UPLOAD", "ANNULATION",
];

const ALL_DOC_TYPES: DocumentType[] = [
  "DIT", "OR", "FAC", "RI", "TIK", "DA", "DOM",
  "BDM", "CAS", "CDE", "DEV", "BC", "AC", "CDEFRN", "SW", "MUT",
];

export default function AuditOperationPage() {
  const [search, setSearch]       = useState("");
  const [opType, setOpType]       = useState<OperationType | "">("");
  const [docType, setDocType]     = useState<DocumentType | "">("");
  const [failOnly, setFailOnly]   = useState(false);
  const [limit, setLimit]         = useState(100);

  const { data: logs = [], isLoading, refetch } = useQuery<OpLog[]>({
    queryKey: ["audit", "operation", limit, opType, docType, failOnly],
    queryFn: () =>
      fetchOperationLogs({
        limit,
        operationType: opType || undefined,
        documentType:  docType || undefined,
        failuresOnly:  failOnly,
      }),
  });

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.username?.toLowerCase().includes(q) ||
      l.documentNumber?.toLowerCase().includes(q) ||
      l.documentId?.toLowerCase().includes(q) ||
      l.errorCode?.toLowerCase().includes(q) ||
      l.successMessage?.toLowerCase().includes(q) ||
      l.errorMessage?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total:    logs.length,
    succes:   logs.filter((l) => l.isSuccess).length,
    echecs:   logs.filter((l) => !l.isSuccess).length,
    avgMs:    logs.filter((l) => l.durationMs != null).length > 0
      ? Math.round(logs.filter((l) => l.durationMs != null).reduce((s, l) => s + (l.durationMs ?? 0), 0) / logs.filter((l) => l.durationMs != null).length)
      : null,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Historique Opérations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Soumissions, validations, suppressions, uploads, copies DocuWare…
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RefreshCw size={14} /> Actualiser
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total"   value={stats.total}  sub={`${limit} dernières`}           color="gray" />
        <StatCard label="Succès"  value={stats.succes} sub={`${stats.total ? Math.round(stats.succes / stats.total * 100) : 0} %`} color="green" />
        <StatCard label="Échecs"  value={stats.echecs} sub={`${stats.total ? Math.round(stats.echecs / stats.total * 100) : 0} %`} color="red" />
        <StatCard label="Durée moy." value={stats.avgMs != null ? `${stats.avgMs} ms` : "—"} sub="opérations mesurées" color="blue" isText />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Rechercher par utilisateur, N° doc, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-8 text-xs rounded border border-gray-200 px-2 bg-white text-gray-600"
          value={opType}
          onChange={(e) => setOpType(e.target.value as OperationType | "")}
        >
          <option value="">Toutes les opérations</option>
          {ALL_OP_TYPES.map((t) => (
            <option key={t} value={t}>{OP_CONFIG[t]?.label ?? t}</option>
          ))}
        </select>

        <select
          className="h-8 text-xs rounded border border-gray-200 px-2 bg-white text-gray-600"
          value={docType}
          onChange={(e) => setDocType(e.target.value as DocumentType | "")}
        >
          <option value="">Tous les documents</option>
          {ALL_DOC_TYPES.map((t) => (
            <option key={t} value={t}>{t} — {DOC_LABELS[t] ?? t}</option>
          ))}
        </select>

        <button
          onClick={() => setFailOnly((f) => !f)}
          className={`h-8 text-xs px-3 rounded border transition-colors flex items-center gap-1.5 ${
            failOnly
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          <XCircle size={13} /> Échecs seulement
        </button>

        <select
          className="h-8 text-xs rounded border border-gray-200 px-2 bg-white text-gray-600"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={50}>50 dernières</option>
          <option value={100}>100 dernières</option>
          <option value={200}>200 dernières</option>
          <option value={500}>500 dernières</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-6" />
              <TableHead>Date / Heure</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Société</TableHead>
              <TableHead>Opération</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Résultat</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Durée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-400 py-10">Chargement…</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-400 py-10">
                  Aucune opération trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => <OpRow key={log.id} log={log} />)
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-gray-400 text-right">
        {filtered.length} / {logs.length} opération(s) affichée(s) — cliquez sur une ligne pour voir les détails
      </p>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, isText = false,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: "gray" | "green" | "red" | "blue";
  isText?: boolean;
}) {
  const borders: Record<string, string> = {
    gray:  "bg-gray-50 border-gray-200",
    green: "bg-green-50 border-green-100",
    red:   "bg-red-50 border-red-100",
    blue:  "bg-blue-50 border-blue-100",
  };
  return (
    <div className={`border rounded-md p-3 ${borders[color]}`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`font-bold mt-1 ${isText ? "text-lg" : "text-2xl"} text-gray-800`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
