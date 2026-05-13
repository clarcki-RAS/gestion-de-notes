"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchAuditNotes, AuditNote, AuditStats, AuditFilters } from "../../services/api";


// ─── Types locaux ────────────────────────────────────────────────
type OperationType = "ajout" | "modification" | "suppression";

const BADGE: Record<OperationType, { label: string; classes: string }> = {
  ajout: { label: "INSERT", classes: "bg-emerald-100 text-emerald-700 border border-emerald-300" },
  modification: { label: "UPDATE", classes: "bg-amber-100 text-amber-700 border border-amber-300" },
  suppression: { label: "DELETE", classes: "bg-red-100 text-red-700 border border-red-300" },
};

const OPERATION_TYPES = [
  { value: "", label: "Toutes" },
  { value: "ajout", label: "INSERT" },
  { value: "modification", label: "UPDATE" },
  { value: "suppression", label: "DELETE" },
];

const DEFAULT_FILTERS: AuditFilters = {
  type_operation: "",
  name: "",
  etudiant: "",
  matiere: "",
  date_de: "",
  date_a: "",
};

// ─── Helpers ─────────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("fr-FR"),
    heure: d.toLocaleTimeString("fr-FR"),
  };
}

function noteDisplay(val: number | null) {
  if (val === null) return <span className="text-zinc-300 font-mono">—</span>;
  return <span className="font-mono text-zinc-700">{val}/20</span>;
}

// ─── Page principale ─────────────────────────────────────────────
export default function AuditPage() {
  const router = useRouter();
  const [data, setData] = useState<AuditNote[]>([]);
  const [stats, setStats] = useState<AuditStats>({ insertions: 0, modifications: 0, suppressions: 0 });
  const [filters, setFilters] = useState<AuditFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // Redirection si pas admin
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") router.push("/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  // Chargement des données
  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditNotes(filters);
      setData(res.data);
      setStats(res.stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const interval = setInterval(() => load(true), 2000);
    return () => clearInterval(interval);
  }, [load]);

  // Recherche globale locale
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      row.nom.toLowerCase().includes(q) ||
      row.name.toLowerCase().includes(q) ||
      row.design.toLowerCase().includes(q) ||
      row.type_operation.toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (key: keyof AuditFilters, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  useEffect(() => { setPage(1); }, [filters, search]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="font-mono text-sm text-zinc-400 uppercase tracking-widest">Supervision</span>
            <span className="text-zinc-300">/</span>
            <span className="font-mono text-sm text-zinc-700">Audit des notes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-400">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => load()}
              className="text-xs font-mono text-zinc-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded border border-zinc-200 hover:border-emerald-300"
            >
              ↻ Actualiser
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-mono text-white bg-red-400 hover:bg-red-500 transition-colors px-3 py-1 rounded border border-red-400 hover:border-red-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Erreur */}
        {error && (
          <div className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-mono">
            ⚠ {error}
          </div>
        )}

        {/* Barre de recherche */}
        <div className="flex flex-col gap-3">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un étudiant, utilisateur, matière..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 font-mono focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 shadow-sm transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">✕</button>
            )}
          </div>

          {/* Filtres avancés */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 text-sm font-mono shadow-sm hover:border-zinc-300 hover:text-zinc-700 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
              </svg>
              Filtres avancés
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />}
              <svg className={`w-3 h-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {hasActiveFilters && (
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors">
                Réinitialiser
              </button>
            )}
          </div>

          {filtersOpen && (
            <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-sm grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Type opération */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Type d&apos;opération</label>
                <div className="flex gap-2 flex-wrap">
                  {OPERATION_TYPES.map((op) => (
                    <button
                      key={op.value}
                      onClick={() => update("type_operation", op.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${filters.type_operation === op.value
                          ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                          : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                        }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Utilisateur */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Utilisateur</label>
                <input type="text" value={filters.name} onChange={(e) => update("name", e.target.value)} placeholder="Admin Test..."
                  className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-700 placeholder-zinc-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all" />
              </div>

              {/* Étudiant */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Étudiant</label>
                <input type="text" value={filters.etudiant} onChange={(e) => update("etudiant", e.target.value)} placeholder="Rakoto..."
                  className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-700 placeholder-zinc-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all" />
              </div>

              {/* Matière */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Matière</label>
                <input type="text" value={filters.matiere} onChange={(e) => update("matiere", e.target.value)} placeholder="Mathématiques..."
                  className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-700 placeholder-zinc-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all" />
              </div>

              {/* Date de */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Du</label>
                <input type="date" value={filters.date_de} onChange={(e) => update("date_de", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-700 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all" />
              </div>

              {/* Date à */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Au</label>
                <input type="date" value={filters.date_a} onChange={(e) => update("date_a", e.target.value)}
                  className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-700 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all" />
              </div>
            </div>
          )}
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-zinc-400 font-mono text-sm">
            Chargement...
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    {["Opération", "Date / Heure", "Étudiant", "Matière", "Note (anc. → nouv.)", "Utilisateur"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && page === 1 ? (
                    <>
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-zinc-400 font-mono text-sm h-[53px]">
                          Aucune opération trouvée.
                        </td>
                      </tr>
                      {Array.from({ length: PAGE_SIZE - 1 }).map((_, i) => (
                        <tr key={`empty-${i}`} className="border-b border-zinc-100">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <td key={j} className="px-4 py-3 h-[53px]" />
                          ))}
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      {paginated.map((row) => {
                        const { date, heure } = formatDate(row.date_mise_a_jour);
                        const badge = BADGE[row.type_operation as OperationType];
                        return (
                          <tr key={row.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold tracking-widest ${badge.classes}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-zinc-700 font-mono text-xs">{date}</div>
                              <div className="text-zinc-400 font-mono text-xs">{heure}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-zinc-800 text-sm">{row.nom}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-zinc-800 text-sm">{row.design}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {noteDisplay(row.note_ancien)}
                                <span className="text-zinc-300">→</span>
                                {noteDisplay(row.note_nouv)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-emerald-600 font-mono text-xs">{row.name}</div>
                              {row.machine_hote && (
                                <div className="text-zinc-400 font-mono text-xs">{row.machine_hote}</div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {Array.from({ length: PAGE_SIZE - paginated.length }).map((_, i) => (
                        <tr key={`empty-${i}`} className="border-b border-zinc-100">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <td key={j} className="px-4 py-3 h-[53px]" />
                          ))}
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
              <span className="text-zinc-400 text-xs font-mono">
                Page {page} / {totalPages} — {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-mono border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-mono border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant →
                </button>
              </div>
            </div>

            {/* Résumé */}
            <div className="flex items-center gap-6 px-4 py-3 border-t border-zinc-100 bg-zinc-50">
              <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Résumé</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-zinc-500 text-xs font-mono">Insertions : <span className="text-emerald-600 font-semibold">{stats.insertions}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="text-zinc-500 text-xs font-mono">Modifications : <span className="text-amber-500 font-semibold">{stats.modifications}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                <span className="text-zinc-500 text-xs font-mono">Suppressions : <span className="text-red-500 font-semibold">{stats.suppressions}</span></span>
              </div>
              <div className="ml-auto text-zinc-400 text-xs font-mono">
                Total : {stats.insertions + stats.modifications + stats.suppressions} opération{stats.insertions + stats.modifications + stats.suppressions !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}