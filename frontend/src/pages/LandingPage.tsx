import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BenefitsGrid from "../components/BenefitsGrid";
import BuyButton from "../components/BuyButton";
import HowItWorksSection from "../components/HowItWorksSection";
import ImageCarousel from "../components/ImageCarousel";
import ReviewsSection from "../components/ReviewsSection";
import StickyBuyBar from "../components/StickyBuyBar";
import { apiClient } from "../lib/apiClient";
import { formatMxn } from "../lib/format";
import type { ProductDetail } from "../lib/types";

function TrustItem({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-nova-ink-muted sm:text-xs">
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

/** Landing de producto orientada a conversión (tráfico de redes sociales). */
export default function LandingPage() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    document.title = "Cargando… · novaShop";
    apiClient
      .get<ProductDetail>(`/api/products/${slug}`)
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
      <section className="mx-auto max-w-3xl px-4 py-6" aria-busy="true" aria-live="polite">
        <div className="aspect-square w-full animate-pulse rounded-3xl bg-white/5 sm:aspect-[4/3]" />
        <div className="mt-5 flex flex-col gap-3">
          <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-9 w-3/4 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-40 animate-pulse rounded bg-white/5" />
          <div className="h-16 w-full animate-pulse rounded-2xl bg-white/5" />
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <p className="text-5xl" aria-hidden="true">🛍️</p>
        <p className="max-w-md text-lg">
          {error ?? "El producto que buscas no existe o ya no está disponible."}
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

  const stockLabel =
    product.stock > 0 && product.stock <= 12
      ? `¡Solo quedan ${product.stock} unidades!`
      : `${product.stock} unidades disponibles`;

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 pb-28 pt-4 md:pb-12">
        {/* 1. Above the fold */}
        <ImageCarousel images={product.imageUrls ?? []} name={product.name} />

        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.available ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-nova-teal/10 px-3 py-1 text-xs font-bold text-nova-teal ring-1 ring-nova-teal/25">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nova-teal" aria-hidden="true" />
                {stockLabel}
              </span>
            ) : (
              <span className="rounded-full bg-nova-coral/15 px-3 py-1 text-xs font-bold text-nova-coral ring-1 ring-nova-coral/30">
                No Disponible
              </span>
            )}
            <span className="text-xs text-nova-ink-muted">{product.categoryName}</span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-nova-ink-muted">
            <span className="text-nova-primary" aria-hidden="true">★★★★★</span>
            <span>4.9 · 127 reseñas · +1,200 vendidos</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 max-w-prose whitespace-pre-line text-sm leading-relaxed text-nova-ink-muted sm:text-base">
            {product.description}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="font-display text-4xl font-bold text-nova-primary">
              {formatMxn(product.priceCents)}
            </p>
            <p className="pb-1 text-sm text-nova-ink-muted">Envío se confirma por WhatsApp</p>
          </div>

          <div className="mt-4">
            <BuyButton slug={product.slug} productAvailable={product.available} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <TrustItem icon="💵" label="Pago contra entrega" />
            <TrustItem icon="🚚" label="Envío seguro" />
            <TrustItem icon="🤖" label="Atención IA 24/7" />
          </div>
        </div>

        {/* 2. Beneficios */}
        <BenefitsGrid />

        {/* 3. Prueba social */}
        <ReviewsSection />

        {/* 4. Cómo funciona */}
        <HowItWorksSection />

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-sm text-nova-ink-muted">
            ¿Dudas? Escríbenos por WhatsApp y te respondemos al instante.
          </p>
        </div>
      </article>

      {/* 5. Sticky CTA móvil */}
      <StickyBuyBar
        slug={product.slug}
        priceCents={product.priceCents}
        available={product.available}
      />
    </>
  );
}
