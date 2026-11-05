import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./session";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-nova-bg px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-nova-surface p-6 shadow-lg ring-1 ring-black/5"
      >
        <h1 className="text-xl font-bold">
          nova<span className="text-nova-primary">Shop</span> · Admin
        </h1>
        <p className="mt-1 text-sm text-nova-ink-muted">Entremos al panel con credenciales.</p>

        <label className="mt-4 block text-sm font-medium">
          Usuario
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 focus:border-nova-primary focus:outline-none"
          />
        </label>
        <label className="mt-3 block text-sm font-medium">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 focus:border-nova-primary focus:outline-none"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-nova-primary py-2.5 font-semibold text-white hover:bg-nova-primary-strong disabled:bg-neutral-400"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
