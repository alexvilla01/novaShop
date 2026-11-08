import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { apiClient } from "../lib/apiClient";
import type { CategoryDto, ProductSummary } from "../lib/types";

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<CategoryDto[]>("/api/categories")
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const category = categories.find((c) => c.slug === slug) ?? null;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    apiClient
      .get<{ content: ProductSummary[] }>(`/api/products?category=${encodeURIComponent(slug)}`)
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
  }, [slug]);

  useEffect(() => {
    document.title = category ? `${category.name} · novaShop` : "Categoría · novaShop";
  }, [category]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        {category?.name ?? "Categoría"}
      </h1>
      <p className="mt-1 text-sm text-nova-ink-muted">
        {loading ? "Cargando productos…" : `${products.length} productos`}
      </p>

      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-5 rounded-2xl border border-nova-coral/30 bg-nova-coral/10 px-6 py-10 text-center text-nova-coral">
          {error}
        </p>
      ) : products.length === 0 ? (
        <div className="glass-panel mt-5 flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden="true">🛍️</p>
          <p className="text-nova-ink-muted">Vuelve pronto, pronto habrá novedades por aquí.</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
