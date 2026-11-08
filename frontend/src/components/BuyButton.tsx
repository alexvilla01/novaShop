import { useEffect, useRef, useState } from "react";
import { apiClient } from "../lib/apiClient";
import type { OrderCreatedResponse } from "../lib/types";

interface Props {
  slug: string;
  productAvailable: boolean;
  /** Variante visual: hero (grande) o barra sticky móvil. */
  variant?: "hero" | "compact";
}

function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.69 8.21-8.23 8.21Z" />
    </svg>
  );
}

/**
 * Botón Comprar del embudo (FR-004/FR-005): una llamada atómica que crea la
 * orden preliminar y redirige a WhatsApp con el deep link del backend.
 */
export default function BuyButton({ slug, productAvailable, variant = "hero" }: Props) {
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

  const hero =
    "w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-nova-primary to-nova-coral px-6 py-5 font-display text-lg font-bold text-[#1a1205] shadow-[0_18px_50px_-18px_rgba(255,158,25,0.75)] transition hover:brightness-105 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-nova-teal disabled:cursor-wait disabled:opacity-70";
  const compact =
    "items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nova-primary to-nova-coral px-4 py-3 font-display text-sm font-bold text-[#1a1205] shadow-lg shadow-nova-primary/25 transition hover:brightness-105 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-nova-teal disabled:cursor-wait disabled:opacity-70";

  return (
    <div className={variant === "hero" ? "flex w-full flex-col gap-2" : "flex flex-col gap-1"}>
      <button
        type="button"
        onClick={postOrder}
        disabled={loading}
        className={`inline-flex ${variant === "hero" ? hero : compact}`}
      >
        <WhatsAppIcon className={variant === "hero" ? "h-6 w-6" : "h-5 w-5"} />
        {justPurchased
          ? "✓ Te esperamos en WhatsApp"
          : loading
            ? "Abriendo WhatsApp…"
            : "¡Comprar Rápido por WhatsApp!"}
      </button>
      {error && <p className="text-sm text-nova-coral">{error}</p>}
    </div>
  );
}
