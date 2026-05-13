"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ─── SIDEBAR ─────────────────────────────────────────────────────
interface SidebarProps {
  active: "notes" | "etudiants" | "matieres";
  onLogout: () => void;
}

export function Sidebar({ active, onLogout }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const links = [
    { key: "notes",     label: "Gestion des Notes", icon: "📝", path: "/dashboard/notes" },
    { key: "etudiants", label: "Étudiants",          icon: "👨‍🎓", path: "/dashboard/etudiants" },
    { key: "matieres",  label: "Matières",           icon: "📖", path: "/dashboard/matieres" },
  ];

  return (
    <div className="w-60 min-h-screen bg-white border-r border-green-100 flex flex-col justify-between shrink-0 shadow-[2px_0_12px_0_rgba(0,0,0,0.04)]">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-green-700 tracking-tight">📚 BDA</h2>
          <p className="text-green-400 text-xs mt-0.5 font-mono">Gestion des notes</p>
        </div>
        <ul className="space-y-1">
          {links.map((link) => (
            <li
              key={link.key}
              onClick={() => router.push(link.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-sm font-medium ${
                active === link.key
                  ? "bg-green-50 text-green-700 shadow-sm border border-green-100"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 border-t border-green-50">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
      >
        <span>🚪</span> Se déconnecter
      </button>
      </div>
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "confirm";

export interface ToastState {
  message: string;
  type: ToastType;
  onConfirm?: () => void;
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast && toast.type !== "confirm") {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const styles = {
    success: "bg-white border-green-200 shadow-green-100",
    error:   "bg-white border-red-200 shadow-red-100",
    confirm: "bg-white border-zinc-200 shadow-zinc-100",
  };

  const iconStyles = {
    success: "bg-green-100 text-green-600",
    error:   "bg-red-100 text-red-500",
    confirm: "bg-amber-100 text-amber-600",
  };

  const icons = { success: "✓", error: "✕", confirm: "!" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-none">
      <div className={`pointer-events-auto border rounded-2xl shadow-xl px-5 py-4 max-w-sm w-full mx-4 ${styles[toast.type]}`}>
        <div className="flex items-start gap-3">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${iconStyles[toast.type]}`}>
            {icons[toast.type]}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-700">{toast.message}</p>
            {toast.type === "confirm" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { toast.onConfirm?.(); onClose(); }}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Confirmer
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  error?: string;
  children: React.ReactNode;
}

export function Modal({ title, onClose, onSave, error, children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-2xl p-8 w-96">
        <h2 className="text-lg font-bold text-zinc-800 mb-6">{title}</h2>
        {children}
        {error && <p className="text-red-500 text-sm mt-1 mb-3">{error}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-sm font-medium transition-colors">
            Annuler
          </button>
          <button onClick={onSave} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES PARTAGÉS ─────────────────────────────────────────────
export const inputClass  = "w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all mb-4";
export const selectClass = "w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all mb-4";
export const labelClass  = "text-zinc-400 text-xs font-mono uppercase tracking-widest mb-1.5 block";