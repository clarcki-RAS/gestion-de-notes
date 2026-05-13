"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Identifiants incorrects");
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

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      {/* Carte */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-lg w-full max-w-sm p-10">

        {/* En-tête */}
        <div className="text-center mb-8">
          <span className="text-3xl">📚</span>
          <h2 className="text-xl font-bold text-zinc-800 mt-2 tracking-tight">Connexion</h2>
          <p className="text-zinc-400 text-xs font-mono mt-1">Projet BDA — Gestion des notes</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-1.5 block">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {/* Bouton register */}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Créer un compte
          </button>
        </form>
      </div>
    </div>
  );
}