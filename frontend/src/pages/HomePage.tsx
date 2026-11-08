import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FlashBanner from "../components/FlashBanner";
import ProductCard from "../components/ProductCard";
import { apiClient } from "../lib/apiClient";
import type { ProductSummary } from "../lib/types";

export default function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params] = useSearchParams();
  const query = (params.get("q") ?? "").trim();

  useEffect(() => {
    document.title = query ? `Buscar: ${query} · novaShop` : "novaShop · Catálogo";
  }, [query]);

  useEffect(() => {
    let active = true;
    apiClient
      .get<{ content: ProductSummary[] }>("/api/products")
      .then((page) => {
        if (active) setProducts(page.content);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const normalized = query.toLowerCase();
  const visible = normalized
    ? products.filter((p) =>
        `${p.name} ${p.categoryName}`.toLowerCase().includes(normalized),
      )
    : products;

  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
      <h1 className="sr-only">Catálogo novaShop</h1>
      <FlashBanner />

      {query && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-nova-ink-muted">
            Resultados para <span className="font-semibold text-nova-ink">“{query}”</span> ({visible.length})
          </p>
          <Link to="/" className="text-sm text-nova-aurora hover:underline">
            Limpiar búsqueda
          </Link>
        </div>
      )}

      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-5 rounded-2xl border border-nova-coral/30 bg-nova-coral/10 px-6 py-10 text-center text-nova-coral">
          {error}
        </p>
      ) : visible.length === 0 ? (
        <div className="glass-panel mt-5 flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden="true">🔍</p>
          <p className="text-nova-ink-muted">
            {query ? "Sin resultados para tu búsqueda." : "Vuelve pronto, habrá novedades."}
          </p>
          {query && (
            <Link to="/" className="text-sm font-semibold text-nova-aurora hover:underline">
              Ver todo el catálogo
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
