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
