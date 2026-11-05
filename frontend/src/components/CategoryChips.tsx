import { Link } from "react-router-dom";
import type { CategoryDto } from "../lib/types";

interface Props {
  categories: CategoryDto[];
  activeSlug?: string;
}

/** Chips de navegación de categorías (FR-003). */
export default function CategoryChips({ categories, activeSlug }: Props) {
  return (
    <nav aria-label="categorías" className="flex flex-wrap gap-2">
      <Link
        to="/"
        aria-current={activeSlug === undefined ? "page" : undefined}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          activeSlug === undefined
            ? "bg-nova-primary text-white"
            : "bg-nova-surface text-nova-ink ring-1 ring-black/10 hover:bg-black/5"
        }`}
      >
        Todos
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          to={`/c/${c.slug}`}
          aria-current={activeSlug === c.slug ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeSlug === c.slug
              ? "bg-nova-primary text-white"
              : "bg-nova-surface text-nova-ink ring-1 ring-black/10 hover:bg-black/5"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
