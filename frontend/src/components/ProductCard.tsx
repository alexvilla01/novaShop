import { Link } from "react-router-dom";
import { formatMxn } from "../lib/format";
import type { ProductSummary } from "../lib/types";

interface Props {
  product: ProductSummary;
}

/** Tarjeta del catálogo (FR-001/FR-002): glass, precio destacado y CTA secundario. */
export default function ProductCard({ product }: Props) {
  const url = `/p/${product.slug}`;
  const initial = product.name.trim().charAt(0).toUpperCase();

  return (
    <article className="glass-panel group flex flex-col overflow-hidden rounded-2xl transition hover:border-white/20 hover:shadow-xl hover:shadow-nova-primary/5">
      <Link to={url} className="relative block overflow-hidden">
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-slate-800/70 to-slate-900">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 font-display text-xl font-bold text-nova-primary ring-1 ring-white/10"
              aria-hidden="true"
            >
              {initial}
            </span>
          )}
        </div>
        {!product.available && (
          <span className="absolute left-3 top-3 rounded-full bg-nova-coral/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Agotado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="text-[11px] uppercase tracking-wider text-nova-ink-muted">
          {product.categoryName}
        </span>
        <Link to={url} className="line-clamp-2 font-display font-semibold leading-snug hover:text-nova-primary">
          {product.name}
        </Link>
        <p className="mt-1 font-display text-lg font-bold text-nova-primary">
          {formatMxn(product.priceCents)}
        </p>
        {product.available ? (
          <p className="text-xs text-nova-positive">Disponible</p>
        ) : (
          <p className="text-xs font-semibold text-nova-coral">No Disponible</p>
        )}
        <Link
          to={url}
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-nova-ink ring-1 ring-white/10 transition hover:bg-white/10"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  );
}
