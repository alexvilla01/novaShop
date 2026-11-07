import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";
import { formatMxn } from "../lib/format";
import type { CategoryDto, AdminProduct, ProductMutationPayload } from "../lib/types";

interface AdminProductPage {
  content: AdminProduct[];
  totalElements: number;
}

const EMPTY_FORM: ProductMutationPayload = {
  slug: "",
  name: "",
  description: "",
  priceCents: 0,
  stock: 0,
  origin: "PROPIO",
  imageUrls: [],
  categorySlug: "",
};

/** Gestión del catálogo con validaciones espejo del backend (T033). */
export default function ProductsAdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductMutationPayload>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [imagesText, setImagesText] = useState("");

  const validate = (payload: ProductMutationPayload): string | null => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.slug ?? "")) {
      return "El slug debe ser kebab-case (minúsculas, números y guiones).";
    }
    if (!payload.name.trim()) return "El nombre es obligatorio.";
    if (!(payload.priceCents > 0)) return "El precio debe ser mayor a 0.";
    if (!(payload.stock >= 0)) return "El stock no puede ser negativo.";
    if (payload.imageUrls.length > 5) return "Máximo 5 imágenes por producto.";
    if (!payload.categorySlug) return "Selecciona una categoría.";
    return null;
  };

  const load = () => {
    Promise.all([
      apiClient.get<AdminProductPage>("/api/admin/products"),
      apiClient.get<CategoryDto[]>("/api/categories"),
    ])
      .then(([page, cats]) => {
        setProducts(page.content);
        setCategories(cats);
      })
      .catch((err: Error) => setError(err.message));
  };

  useEffect(load, []);

  const startEdit = (p: AdminProduct) => {
    setEditing(p);
    setFormError(null);
    const images = Array.isArray(p.imageUrls) ? p.imageUrls : [];
    setImagesText(images.join("\n"));
    setForm({
      slug: p.slug,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      stock: p.stock,
      origin: p.origin,
      imageUrls: images,
      categorySlug: p.categorySlug ?? "",
    });
  };

  const startCreate = () => {
    setEditing(null);
    setFormError(null);
    setImagesText("");
    setForm(EMPTY_FORM);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload: ProductMutationPayload = {
      ...form,
      imageUrls: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    const invalid = validate(payload);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await apiClient.put(`/api/admin/products/${editing.id}`, payload);
      } else {
        await apiClient.post("/api/admin/products", payload);
      }
      startCreate();
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (id: number, name: string) => {
    if (!window.confirm(`¿Desactivar "${name}"? Dejará de mostrarse en el catálogo.`)) {
      return;
    }
    setBusy(true);
    try {
      await apiClient.delete(`/api/admin/products/${id}`);
      load();
    } finally {
      setBusy(false);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = products.filter((p) => {
    const matchesQuery =
      !normalizedQuery ||
      `${p.name} ${p.slug}`.toLowerCase().includes(normalizedQuery);
    const matchesCategory = !categoryFilter || p.categorySlug === categoryFilter;
    return matchesQuery && matchesCategory;
  });
  const hasFilters = query.trim() !== "" || categoryFilter !== "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Productos ({visibleProducts.length}
          {visibleProducts.length !== products.length && ` de ${products.length}`})
        </h1>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-full bg-nova-primary px-4 py-2 text-sm font-semibold text-white hover:bg-nova-primary-strong"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o slug…"
          aria-label="Buscar productos"
          className="w-full rounded-full bg-nova-surface px-4 py-2 text-sm ring-1 ring-black/10 focus:outline focus:outline-2 focus:outline-offset-1 outline-nova-primary sm:max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filtrar por categoría"
          className="rounded-full bg-nova-surface px-4 py-2 text-sm ring-1 ring-black/10"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategoryFilter("");
            }}
            className="text-sm text-nova-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}

      <section className="overflow-x-auto rounded-2xl bg-nova-surface ring-1 ring-black/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase text-nova-ink-muted">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-nova-ink-muted">
                  No hay productos que coincidan con los filtros.
                </td>
              </tr>
            )}
            {visibleProducts.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-nova-ink-muted">/{p.slug} · {p.categoryName}</p>
                </td>
                <td className="px-4 py-3">{formatMxn(p.priceCents)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.origin}</td>
                <td className="px-4 py-3">
                  {p.isActive ? (
                    <span className="text-green-700">Activo</span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded-full px-3 py-1 text-xs ring-1 ring-black/10 hover:bg-black/5"
                    >
                      Editar
                    </button>
                    {p.isActive && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deactivate(p.id, p.name)}
                        className="rounded-full px-3 py-1 text-xs text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl bg-nova-surface p-5 ring-1 ring-black/5">
        <h2 className="font-bold">
          {editing ? `Editar: ${editing.name}` : "Crear producto nuevo"}
        </h2>
        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium md:col-span-2">
            Slug (kebab-case)
            <input
              value={form.slug ?? ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Nombre
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Categoría
            <select
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              required
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            >
              <option value="">Selecciona…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Precio (centavos MXN)
            <input
              type="number"
              min={1}
              value={form.priceCents}
              onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })}
              required
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Stock
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              required
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Origen
            <select
              value={form.origin}
              onChange={(e) =>
                setForm({ ...form, origin: e.target.value as ProductMutationPayload["origin"] })
              }
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            >
              <option value="PROPIO">PROPIO</option>
              <option value="DROPSHIPPING">DROPSHIPPING</option>
            </select>
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Descripción
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Imágenes (URLs, una por línea, máx 5)
            <textarea
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            />
          </label>
          {formError && (
            <p className="text-sm text-red-600 md:col-span-2">{formError}</p>
          )}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-nova-primary px-6 py-2.5 font-semibold text-white hover:bg-nova-primary-strong disabled:bg-neutral-400"
            >
              {editing ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
