import { useEffect, useState } from "react";
import CategoryChips from "../components/CategoryChips";
import ProductCard from "../components/ProductCard";
import { apiClient } from "../lib/apiClient";
import type { CategoryDto, ProductSummary } from "../lib/types";

export default function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "novaShop · Catálogo";
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiClient.get<{ content: ProductSummary[] }>("/api/products"),
      apiClient.get<CategoryDto[]>("/api/categories"),
    ])
      .then(([page, cats]) => {
        if (active) {
          setProducts(page.content);
          setCategories(cats);
        }
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

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl brand-gradient p-6 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Compra directo, sin vueltas
          </h1>
          <p className="mt-1 max-w-xl text-sm text-nova-ink-muted sm:text-base">
            Elige tu producto y confirma por WhatsApp con el vendedor. Sin carritos,
            sin cuentas y sin comisiones.
          </p>
        </div>
        <img
          src="/logonovaShop.jpg"
          alt=""
          aria-hidden="true"
          className="hidden h-20 w-20 rounded-2xl object-cover ring-2 ring-white/70 sm:block"
        />
      </div>

      <CategoryChips categories={categories} />

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-black/5" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-6 py-10 text-center text-red-700">{error}</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
