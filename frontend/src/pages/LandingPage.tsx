import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BuyButton from "../components/BuyButton";
import ProductCard from "../components/ProductCard";
import { formatMxn } from "../lib/format";
import type { ProductDetail, ProductSummary } from "../lib/types";
import { apiClient } from "../lib/apiClient";

export default function LandingPage() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setRelated([]);
    document.title = `Cargando… · novaShop`;
    apiClient.get<ProductDetail>(`/api/products/${slug}`)
      .then((p) => {
        if (active) {
          setProduct(p);
          document.title = `${p.name} · novaShop`;
          const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
          if (meta) meta.content = p.description.slice(0, 160);
          const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
          if (og) og.content = `${p.name} · novaShop`;
        }
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
        document.title = "Producto no encontrado · novaShop";
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    let active = true;
    apiClient
      .get<{ content: ProductSummary[] }>(
        `/api/products?category=${encodeURIComponent(product.categorySlug)}`,
      )
      .then((page) => {
        if (active) {
          setRelated(page.content.filter((p) => p.slug !== product.slug).slice(0, 4));
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [product]);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12" aria-busy="true" aria-live="polite">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-black/5" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 animate-pulse rounded bg-black/5" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-black/5" />
            <div className="h-8 w-36 animate-pulse rounded bg-black/5" />
            <div className="h-20 w-full animate-pulse rounded bg-black/5" />
            <div className="h-14 w-48 animate-pulse rounded-full bg-black/5" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <p className="text-5xl">🛍️</p>
        <p className="max-w-md text-lg text-nova-ink">
          {error ?? "El producto que buscas no existe o ya no está disponible."}
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

  return (
    <article className="mx-auto max-w-6xl px-4 pb-16">
      <nav aria-label="ruta" className="pt-6 text-sm text-nova-ink-muted">
        <Link to="/" className="hover:text-nova-primary">
          Catálogo
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link to={`/c/${product.categorySlug}`} className="hover:text-nova-primary">
          {product.categoryName}
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-nova-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 py-6 md:grid-cols-2">
        <div className="flex aspect-[4/3] w-full items-center justify-center self-start overflow-hidden rounded-2xl brand-gradient md:max-h-[480px]">
          {product.imageUrls?.[0] ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3" aria-hidden="true">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/70 text-4xl font-bold text-nova-primary shadow-sm ring-1 ring-black/5">
                {product.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-nova-ink-muted">
                Sin foto
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-widest text-nova-ink-muted">
            {product.categoryName}
          </p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-nova-primary">{formatMxn(product.priceCents)}</p>
          {product.available ? (
            <p className="text-sm text-green-700">Disponible para envío inmediato</p>
          ) : (
            <p className="inline-block w-fit rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              No Disponible
            </p>
          )}
          <p className="whitespace-pre-line text-nova-ink">{product.description}</p>

          <BuyButton slug={product.slug} productAvailable={product.available} />

          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-nova-surface p-4 ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-wider text-nova-ink-muted">Envío</p>
              <p className="mt-1 text-sm font-medium">Coordinas entrega por WhatsApp</p>
            </div>
            <div className="rounded-2xl bg-nova-surface p-4 ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-wider text-nova-ink-muted">Pago</p>
              <p className="mt-1 text-sm font-medium">Directo y seguro con el vendedor</p>
            </div>
            <div className="rounded-2xl bg-nova-surface p-4 ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-wider text-nova-ink-muted">
                Disponibilidad
              </p>
              <p className="mt-1 text-sm font-medium">
                {product.available ? `${product.stock} piezas listas` : "Agotado por ahora"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="mt-4">
          <h2 id="relacionados" className="text-xl font-bold">
            También te puede interesar
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
