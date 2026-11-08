import { useEffect, useState, type ReactNode } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { getSession, logout } from "./session";

interface Props {
  children?: ReactNode;
}

/** Layout con guard de sesión admin: redirige a login si no hay sesión (T032). */
export default function AdminLayout({ children }: Props) {
  const [checked, setChecked] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSession()
      .then((session) => {
        if (!session) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setUsername(session.username);
      })
      .finally(() => setChecked(true));
  }, [navigate]);

  if (!checked) {
    return (
      <div className="theme-light flex min-h-screen items-center justify-center bg-nova-bg text-nova-ink-muted">
        Cargando panel…
      </div>
    );
  }

  return (
    <div className="theme-light min-h-screen bg-nova-bg text-nova-ink">
      <header className="border-b border-black/5 bg-nova-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4 text-sm">
            <Link to="/admin" className="font-bold">
              nova<span className="text-nova-primary">Shop</span> · Admin
            </Link>
            <Link to="/admin" className="hover:underline">Productos</Link>
            <Link to="/admin/ordenes" className="hover:underline">Órdenes</Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {username && <span className="text-nova-ink-muted">{username}</span>}
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate("/admin/login", { replace: true });
              }}
              className="rounded-full px-3 py-1.5 ring-1 ring-black/10 hover:bg-black/5"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children ?? <Outlet />}</main>    </div>
  );
}
