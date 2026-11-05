import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BuyButton from "../components/BuyButton";
import { formatMxn } from "../lib/format";
import type { ProductDetail } from "../lib/types";
import { apiClient } from "../lib/apiClient";

export default function LandingPage() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
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

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12" aria-busy="true" aria-live="polite">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-black/5" />
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
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center">
        <p className="text-5xl">🛍️</p>
        <p className="max-w-md text-lg text-nova-ink">
          {error ?? "El producto que buscas no existe o ya no está disponible."}
        </p>
        <a
          href="/"
          className="rounded-full bg-nova-primary px-6 py-2.5 font-semibold text-white hover:bg-nova-primary-strong"
        >
          Ir al catálogo
        </a>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-6xl px-4 pb-16">
      <div className="grid gap-8 py-6 md:grid-cols-2">
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl brand-gradient">
          {product.imageUrls?.[0] ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-6xl" aria-hidden="true">✦</span>
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
            <p className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              No Disponible
            </p>
          )}
          <p className="whitespace-pre-line text-nova-ink">{product.description}</p>

          <BuyButton slug={product.slug} productAvailable={product.available} />

          <ul className="mt-2 grid gap-1 text-sm text-nova-ink-muted">
            <li>✓ Pago directo y seguro con el vendedor por WhatsApp</li>
            <li>✓ Sin carritos ni cuentas: confirmas y listo</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
