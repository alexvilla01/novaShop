import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-5xl">🛍️</p>
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-nova-ink-muted">
        El enlace no existe o el producto ya no está disponible.
      </p>
      <Link
        to="/"
        className="rounded-full bg-nova-primary px-6 py-2.5 font-semibold text-white hover:bg-nova-primary-strong"
      >
        Ir al catálogo
      </Link>
    </section>
  );
}
