import { useState, useEffect } from "react";
import { fetchDevis1 } from "../api/devisApi";
import type { Devis } from "../api/devisApi";
import DevisTable1 from "../components/DevisTable1";

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [codeSociete, setCodeSociete] = useState("HF");
  const [sucNeg, setSucNeg] = useState("01");
  const [limit, setLimit] = useState(50);

  const loadDevis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDevis1({ codeSociete, sucNeg, limit });
      setDevis(data);
    } catch (e: unknown) {
      setError(
        "Erreur lors du chargement des devis. Vérifiez que le backend est accessible.",
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevis();
  }, []);

  const filtered = devis.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.NUMERO_DEVIS?.toLowerCase().includes(q) ||
      d.CLIENT?.toLowerCase().includes(q) ||
      d.REFERENCE_CLIENT?.toLowerCase().includes(q) ||
      d.UTILISATEUR_CREATEUR_DEVIS?.toLowerCase().includes(q) ||
      d.CONSTRUCTEUR?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Gestion des Devis
              </h1>
              <p className="text-xs text-gray-500">
                IPS — Système de Suivi des Négociations
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {devis.length} devis chargés
          </span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-5">
        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Code Société
              </label>
              <input
                type="text"
                value={codeSociete}
                onChange={(e) => setCodeSociete(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: HF"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Succursale
              </label>
              <input
                type="text"
                value={sucNeg}
                onChange={(e) => setSucNeg(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: 01"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Limite
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[25, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadDevis}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Actualiser
            </button>

            {/* Recherche */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-600">
                Recherche rapide
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="N° devis, client, référence..."
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Résumé */}
        {!loading && !error && (
          <p className="text-sm text-gray-500">
            Affichage de{" "}
            <span className="font-semibold text-gray-800">
              {filtered.length}
            </span>{" "}
            devis
            {search && ` correspondant à "${search}"`}
          </p>
        )}

        {/* Tableau */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <svg
                className="animate-spin w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <p className="text-sm">Chargement des devis...</p>
            </div>
          </div>
        ) : (
          <DevisTable1 devis={filtered} />
        )}
      </div>
    </div>
  );
}
