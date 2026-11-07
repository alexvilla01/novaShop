import { Link } from "react-router-dom";
import { formatMxn } from "../lib/format";
import type { ProductSummary } from "../lib/types";

interface Props {
  product: ProductSummary;
}

/** Tarjeta del catálogo (FR-001/FR-002): imagen con placeholder, precio MXN y estado. */
export default function ProductCard({ product }: Props) {
  const url = `/p/${product.slug}`;
  const initial = product.name.trim().charAt(0).toUpperCase();
  return (
    <Link
      to={url}
      className="group flex flex-col overflow-hidden rounded-2xl bg-nova-surface ring-1 ring-black/5 transition hover:shadow-lg"
    >
      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden brand-gradient">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2" aria-hidden="true">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-xl font-bold text-nova-primary shadow-sm ring-1 ring-black/5">
              {initial}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-nova-ink-muted">
          {product.categoryName}
        </span>
        <h3 className="font-semibold leading-snug">{product.name}</h3>
        <div className="mt-auto flex flex-col gap-1 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <p className="font-bold text-nova-primary">{formatMxn(product.priceCents)}</p>
          {product.available ? (
            <span className="text-xs text-green-700">Disponible</span>
          ) : (
            <span className="w-fit whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              No Disponible
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
