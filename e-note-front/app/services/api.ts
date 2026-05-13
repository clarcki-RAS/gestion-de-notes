const API_BASE = "http://localhost:8000/api";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") ?? "";
}

export interface AuditNote {
  id: number;
  type_operation: "ajout" | "modification" | "suppression";
  date_mise_a_jour: string;
  etudiant_id: number;
  nom: string;
  design: string;
  note_ancien: number | null;
  note_nouv: number | null;
  user_id: number;
  name: string;
  machine_hote?: string | null;
}

export interface AuditStats {
  insertions: number;
  modifications: number;
  suppressions: number;
}

export interface AuditFilters {
  type_operation?: string;
  name?: string;
  etudiant?: string;
  matiere?: string;
  date_de?: string;
  date_a?: string;
}

export async function fetchAuditNotes(filters: AuditFilters = {}): Promise<{
  data: AuditNote[];
  stats: AuditStats;
}> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val) params.set(key, val);
  });

  const res = await fetch(`${API_BASE}/audit-notes?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
  return res.json();
}