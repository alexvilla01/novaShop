import { Link } from "react-router-dom";
import type { CategoryDto } from "../lib/types";

interface Props {
  categories: CategoryDto[];
  activeSlug?: string;
}

/** Chips de categorías (FR-003): píldoras deslizables horizontalmente. */
export default function CategoryChips({ categories, activeSlug }: Props) {
  const base =
    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition backdrop-blur-md";
  const inactive =
    "bg-white/5 text-nova-ink-muted ring-1 ring-white/10 hover:bg-white/10 hover:text-nova-ink";
  const active =
    "bg-gradient-to-r from-nova-primary to-nova-coral text-[#1a1205] shadow-lg shadow-nova-primary/20";

  return (
    <nav
      aria-label="categorías"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5"
    >
      <Link
        to="/"
        aria-current={activeSlug === undefined ? "page" : undefined}
        className={`${base} ${activeSlug === undefined ? active : inactive}`}
      >
        Todos
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          to={`/c/${c.slug}`}
          aria-current={activeSlug === c.slug ? "page" : undefined}
          className={`${base} ${activeSlug === c.slug ? active : inactive}`}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
