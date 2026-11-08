import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import type { CategoryDto } from "../lib/types";
import CategoryChips from "./CategoryChips";

/** Header fijo: logo, buscador rápido y categorías deslizables (mobile-first). */
export default function SiteHeader() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeSlug = pathname.startsWith("/c/") ? pathname.slice(3) : undefined;

  useEffect(() => {
    apiClient
      .get<CategoryDto[]>("/api/categories")
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/?q=${encodeURIComponent(term)}` : "/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 glass-panel-strong">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logonovaShop.jpg"
              alt="novaShop"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15"
            />
            <span className="font-display text-lg font-bold tracking-tight">
              nova<span className="text-nova-primary">Shop</span>
            </span>
          </Link>

          <form onSubmit={submit} role="search" className="ml-auto w-full max-w-xs">
            <label htmlFor="quick-search" className="sr-only">
              Buscar productos
            </label>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 ring-1 ring-white/10 focus-within:ring-nova-aurora/60">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 shrink-0 text-nova-ink-muted"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                id="quick-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="w-full bg-transparent text-sm text-nova-ink placeholder:text-nova-ink-muted focus:outline-none"
              />
            </div>
          </form>
        </div>

        <CategoryChips categories={categories} activeSlug={activeSlug} />
      </div>
    </header>
  );
}
