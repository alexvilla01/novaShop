import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";

interface Props {
  children?: ReactNode;
}

export default function PublicLayout({ children }: Props) {
  return (
    <div className="brand-gradient flex min-h-screen flex-col text-nova-ink antialiased">
      <SiteHeader />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <footer className="border-t border-white/5 bg-[#080b12]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-xs text-nova-ink-muted">
          <p>
            © {new Date().getFullYear()} novaShop · Venta directa por WhatsApp
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>Pago contra entrega</span>
            <span aria-hidden="true">·</span>
            <span>Envío seguro</span>
            <span aria-hidden="true">·</span>
            <span>Atención 24/7</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
