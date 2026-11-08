import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";

interface Props {
  children?: ReactNode;
}

/**
 * Layout de landing de producto: una sola intención de compra, sin menús
 * externos ni distracciones (solo un regreso al catálogo).
 */
export default function ProductLayout({ children }: Props) {
  return (
    <div className="brand-gradient flex min-h-screen flex-col text-nova-ink antialiased">
      <header className="sticky top-0 z-40 border-b border-white/5 glass-panel-strong">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-nova-ink-muted transition hover:text-nova-ink"
          >
            <span aria-hidden="true">←</span> Catálogo
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logonovaShop.jpg"
              alt="novaShop"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-white/15"
            />
            <span className="font-display text-base font-bold tracking-tight">
              nova<span className="text-nova-primary">Shop</span>
            </span>
          </Link>
          <span className="w-16" aria-hidden="true" />
        </div>
      </header>
      <main className="flex-1">{children ?? <Outlet />}</main>
      <footer className="border-t border-white/5 bg-[#080b12]">
        <div className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-nova-ink-muted">
          © {new Date().getFullYear()} novaShop · Compra segura por WhatsApp
        </div>
      </footer>
    </div>
  );
}
