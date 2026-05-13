"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, Toast, Modal, ToastState, inputClass, selectClass, labelClass } from "../components/ui";

interface Note {
  id: number;
  etudiant_id: number;
  matiere_id: number;
  note: number;
  etudiant?: { id: number; nom: string; moyenne: number };
  matiere?: { id: number; design: string; coef: number };
}

interface Etudiant { id: number; nom: string; }
interface Matiere  { id: number; design: string; coef: number; }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ etudiant_id: 0, matiere_id: 0, note: 0 });
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [machineHote, setMachineHote] = useState<string>("");
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchNotes     = useCallback(async () => { const r = await fetch("http://localhost:8000/api/notes",     { headers: { Authorization: `Bearer ${token}` } }); setNotes(await r.json()); }, [token]);
  const fetchEtudiants = useCallback(async () => { const r = await fetch("http://localhost:8000/api/etudiants", { headers: { Authorization: `Bearer ${token}` } }); setEtudiants(await r.json()); }, [token]);
  const fetchMatieres  = useCallback(async () => { const r = await fetch("http://localhost:8000/api/matieres",  { headers: { Authorization: `Bearer ${token}` } }); setMatieres(await r.json()); }, [token]);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    Promise.all([fetchNotes(), fetchEtudiants(), fetchMatieres()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  fetch("http://localhost:9999")
    .then((r) => r.json())
    .then((d) => setMachineHote(d.hostname))
    .catch(() => setMachineHote("inconnu"));
}, []);

  const handleSave = async () => {
    setError("");
    try {
      const url = editingNote
        ? `http://localhost:8000/api/notes/${editingNote.id}`
        : "http://localhost:8000/api/notes";
      const res = await fetch(url, {
        method: editingNote ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, machine_hote: machineHote }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Erreur lors de l'enregistrement");
        return;
      }
      setIsOpen(false);
      fetchNotes();
      setToast({ message: editingNote ? "Note modifiée avec succès !" : "Note ajoutée avec succès !", type: "success" });
    } catch {
      setError("Erreur de connexion au serveur");
    }
  };

  const handleDelete = (id: number) => {
    setToast({
      message: "Voulez-vous vraiment supprimer cette note ?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:8000/api/notes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchNotes();
          setToast({ message: "Note supprimée avec succès.", type: "success" });
        } catch {
          setToast({ message: "Erreur lors de la suppression.", type: "error" });
        }
      },
    });
  };

  const moyenne = notes.length > 0
    ? notes.reduce((s, n) => s + n.note * (n.matiere?.coef ?? 1), 0) /
      notes.reduce((s, n) => s + (n.matiere?.coef ?? 1), 0)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
    <Sidebar
      active="notes"
      onLogout={() =>
        setToast({
          message: "Voulez-vous vraiment vous déconnecter ?",
          type: "confirm",
          onConfirm: () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login");
          },
        })
      }
    />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex-1 p-10 overflow-auto">
        <h1 className="text-2xl font-bold text-zinc-800 mb-8 tracking-tight">Gestion des Notes</h1>

        {/* Carte moyenne */}
        <div className="bg-white border border-green-100 rounded-2xl p-6 w-56 mb-8 shadow-sm">
          <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-1">Moyenne générale</p>
          <p className="text-3xl font-bold text-green-700">
            {moyenne.toFixed(2)}
            <span className="text-zinc-300 text-lg"> / 20</span>
          </p>
        </div>

        {loading ? (
          <p className="text-zinc-400 font-mono text-sm">Chargement...</p>
        ) : (
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100">
              <p className="text-zinc-400 text-sm font-mono">
                {notes.length} note{notes.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => {
                  setEditingNote(null);
                  setFormData({ etudiant_id: etudiants[0]?.id ?? 0, matiere_id: matieres[0]?.id ?? 0, note: 0 });
                  setIsOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm"
              >
                + Ajouter
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                  {["Étudiant", "Matière", "Note", "Coef", "Actions"].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-mono text-zinc-400 uppercase tracking-widest">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id} className="border-b border-zinc-50 hover:bg-green-50/40 transition-colors">
                    <td className="px-6 py-4 text-zinc-700 font-medium">{n.etudiant?.nom ?? n.etudiant_id}</td>
                    <td className="px-6 py-4 text-zinc-500">{n.matiere?.design ?? n.matiere_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                        n.note >= 10
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        {n.note} / 20
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono text-xs">{n.matiere?.coef ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingNote(n); setFormData({ etudiant_id: n.etudiant_id, matiere_id: n.matiere_id, note: n.note }); setIsOpen(true); }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <Modal
          title={editingNote ? "Modifier la note" : "Ajouter une note"}
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
          error={error}
        >
          <label className={labelClass}>Étudiant</label>
          <select className={selectClass} value={formData.etudiant_id} onChange={(e) => setFormData({ ...formData, etudiant_id: Number(e.target.value) })}>
            <option value={0}>-- Choisir un étudiant --</option>
            {etudiants.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>

          <label className={labelClass}>Matière</label>
          <select className={selectClass} value={formData.matiere_id} onChange={(e) => setFormData({ ...formData, matiere_id: Number(e.target.value) })}>
            <option value={0}>-- Choisir une matière --</option>
            {matieres.map((m) => <option key={m.id} value={m.id}>{m.design} (coef: {m.coef})</option>)}
          </select>

          <label className={labelClass}>Note (0 – 20)</label>
          <input
            type="number"
            min="0"
            max="20"
            className={inputClass}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: Number(e.target.value) })}
          />
        </Modal>
      )}
    </div>
  );
}