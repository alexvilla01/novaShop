import { useEffect, useRef, useState } from "react";
import { apiClient } from "../lib/apiClient";
import type { OrderCreatedResponse } from "../lib/types";

interface Props {
  slug: string;
  productAvailable: boolean;
}

/**
 * Botón Comprar del embudo (FR-004/FR-005): una llamada atómica que crea la
 * orden preliminar y redirige a WhatsApp con el deep link del backend.
 */
export default function BuyButton({ slug, productAvailable }: Props) {
  const [loading, setLoading] = useState(false);
  const [justPurchased, setJustPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const postOrder = async () => {
    setError(null);
    setLoading(true);
    try {
      const created = await apiClient.post<OrderCreatedResponse>("/api/orders", {
        productSlug: slug,
      });
      setJustPurchased(true);
      timerRef.current = window.setTimeout(() => setJustPurchased(false), 1500);
      // Redirect a WhatsApp con payload del backend; fallback: no relanza.
      window.location.href = created.whatsappUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos tomar tu pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (!productAvailable) return null;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={postOrder}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-nova-wa ${
          loading
            ? "bg-neutral-400"
            : justPurchased
              ? "bg-nova-positive"
              : "bg-nova-wa hover:brightness-95"
        }`}
      >
        {justPurchased ? "✓ Agregado" : loading ? "Abriendo WhatsApp…" : "Comprar"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
