import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategoryChips from "../components/CategoryChips";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";
import { apiClient } from "../lib/apiClient";
import type { CategoryDto, ProductSummary } from "../lib/types";

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<CategoryDto[]>("/api/categories").then((cats) => {
      setCategories(cats);
      setActiveCategory(cats.find((c) => c.slug === slug) ?? null);
    }).catch(() => undefined);
  }, [slug]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    document.title = activeCategory
      ? `${activeCategory.name} · novaShop`
      : "Categoría · novaShop";
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
  }, [slug, activeCategory]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <CategoryChips categories={categories} activeSlug={slug} />

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-black/5" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-6 py-10 text-center text-red-700">{error}</p>
      ) : products.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="Vuelve pronto, pronto habrá novedades por aquí." />
        </div>
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
