import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";
import { formatMxn } from "../lib/format";
import type { AdminOrder } from "../lib/types";

/** Órdenes preliminares más recientes primero (FR-011, T034). */
export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Órdenes · novaShop Admin";
    apiClient.get<AdminOrder[]>("/api/admin/orders")
      .then(setOrders)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Órdenes preliminares ({orders.length})</h1>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}

      <section className="overflow-x-auto rounded-2xl bg-nova-surface ring-1 ring-black/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase text-nova-ink-muted">
            <tr>
              <th className="px-4 py-3">Fecha y hora</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Canal</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  {new Date(o.createdAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.productName}</p>
                  <p className="text-xs text-nova-ink-muted">/{o.productSlug}</p>
                </td>
                <td className="px-4 py-3">{o.quantity}</td>
                <td className="px-4 py-3">{formatMxn(o.unitPriceCents)}</td>
                <td className="px-4 py-3">{o.channel}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-nova-ink-muted">
                  Aún no hay órdenes registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
