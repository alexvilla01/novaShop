import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";

interface Props {
  children?: ReactNode;
}

export default function PublicLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-nova-bg text-nova-ink antialiased">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-nova-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logonovaShop.jpg"
              alt="novaShop"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-nova-primary/15"
            />
            <span className="text-lg font-bold tracking-tight">
              nova<span className="text-nova-primary">Shop</span>
            </span>
          </Link>
          <nav aria-label="principal" className="text-sm">
            <Link to="/" className="rounded-full px-3 py-2 hover:bg-black/5">
              Catálogo
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children ?? <Outlet />}</main>
      <footer className="border-t border-black/5 bg-nova-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-nova-ink-muted">
          © {new Date().getFullYear()} novaShop · Venta directa por WhatsApp
        </div>
      </footer>
    </div>
  );
}
