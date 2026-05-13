"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Erreur lors de l'inscription");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      if (data.user.role === "admin") {
        router.push("/admin/audit");
      } else {
        router.push("/dashboard/notes");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all";
  const labelClass = "text-zinc-400 text-xs font-mono uppercase tracking-widest mb-1.5 block";

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-lg w-full max-w-sm p-10">

        {/* En-tête */}
        <div className="text-center mb-8">
          <span className="text-3xl">📚</span>
          <h2 className="text-xl font-bold text-zinc-800 mt-2 tracking-tight">Créer un compte</h2>
          <p className="text-zinc-400 text-xs font-mono mt-1">Projet BDA — Gestion des notes</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nom */}
          <div>
            <label className={labelClass}>Nom</label>
            <input
              type="text"
              placeholder="Votre nom"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              placeholder="example@email.com"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className={labelClass}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Rôle */}
          <div>
            <label className={labelClass}>Rôle</label>
            <select
              className={inputClass}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Bouton inscription */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          {/* Retour login */}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Déjà un compte ? Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}