import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden="true">🛍️</p>
      <h1 className="font-display text-2xl font-bold">Página no encontrada</h1>
      <p className="text-nova-ink-muted">
        El enlace no existe o el producto ya no está disponible.
      </p>
      <Link
        to="/"
        className="rounded-xl bg-gradient-to-r from-nova-primary to-nova-coral px-6 py-3 font-display font-bold text-[#1a1205] shadow-lg shadow-nova-primary/25"
      >
        Ir al catálogo
      </Link>
    </section>
  );
}
