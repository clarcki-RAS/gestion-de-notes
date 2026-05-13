"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, Toast, Modal, ToastState, inputClass, labelClass } from "../components/ui";

interface Matiere {
  id: number;
  design: string;
  coef: number;
}

export default function MatieresPage() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);
  const [formData, setFormData] = useState({ design: "", coef: 1 });
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchMatieres = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/matieres", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatieres(await res.json());
    } catch {
      setToast({ message: "Erreur de chargement", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    fetchMatieres();
  }, []);

  const handleSave = async () => {
    setError("");
    try {
      const url = editingMatiere
        ? `http://localhost:8000/api/matieres/${editingMatiere.id}`
        : "http://localhost:8000/api/matieres";
      const res = await fetch(url, {
        method: editingMatiere ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Erreur lors de l'enregistrement");
        return;
      }
      setIsOpen(false);
      fetchMatieres();
      setToast({ message: editingMatiere ? "Matière modifiée avec succès !" : "Matière ajoutée avec succès !", type: "success" });
    } catch {
      setError("Erreur de connexion au serveur");
    }
  };

  const handleDelete = (id: number) => {
    setToast({
      message: "Voulez-vous vraiment supprimer cette matière ?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:8000/api/matieres/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchMatieres();
          setToast({ message: "Matière supprimée avec succès.", type: "success" });
        } catch {
          setToast({ message: "Erreur lors de la suppression.", type: "error" });
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
    <Sidebar
      active="matieres"
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
        <h1 className="text-2xl font-bold text-zinc-800 mb-8 tracking-tight">Matières</h1>

        {loading ? (
          <p className="text-zinc-400 font-mono text-sm">Chargement...</p>
        ) : (
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100">
              <p className="text-zinc-400 text-sm font-mono">
                {matieres.length} matière{matieres.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => { setEditingMatiere(null); setFormData({ design: "", coef: 1 }); setIsOpen(true); }}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm"
              >
                + Ajouter
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                  <th className="px-6 py-3 text-left text-xs font-mono text-zinc-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-mono text-zinc-400 uppercase tracking-widest">Désignation</th>
                  <th className="px-6 py-3 text-left text-xs font-mono text-zinc-400 uppercase tracking-widest">Coefficient</th>
                  <th className="px-6 py-3 text-left text-xs font-mono text-zinc-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matieres.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-50 hover:bg-green-50/40 transition-colors">
                    <td className="px-6 py-4 text-zinc-300 font-mono text-xs">#{m.id}</td>
                    <td className="px-6 py-4 text-zinc-700 font-medium">{m.design}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-green-50 text-green-700 border border-green-100">
                        coef {m.coef}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingMatiere(m); setFormData({ design: m.design, coef: m.coef }); setIsOpen(true); }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
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
          title={editingMatiere ? "Modifier la matière" : "Ajouter une matière"}
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
          error={error}
        >
          <label className={labelClass}>Désignation</label>
          <input
            type="text"
            placeholder="Nom de la matière"
            className={inputClass}
            value={formData.design}
            onChange={(e) => setFormData({ ...formData, design: e.target.value })}
          />
          <label className={labelClass}>Coefficient</label>
          <input
            type="number"
            min="1"
            className={inputClass}
            value={formData.coef}
            onChange={(e) => setFormData({ ...formData, coef: Number(e.target.value) })}
          />
        </Modal>
      )}
    </div>
  );
}