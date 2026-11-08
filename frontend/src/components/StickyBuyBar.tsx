import BuyButton from "./BuyButton";
import { formatMxn } from "../lib/format";

interface Props {
  slug: string;
  priceCents: number;
  available: boolean;
}

/** CTA sticky móvil: WhatsApp siempre al alcance del pulgar. */
export default function StickyBuyBar({ slug, priceCents, available }: Props) {
  if (!available) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="glass-panel-strong flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-nova-ink-muted">Precio hoy</p>
          <p className="font-display text-lg font-bold text-nova-primary">
            {formatMxn(priceCents)}
          </p>
        </div>
        <BuyButton slug={slug} productAvailable={available} variant="compact" />
      </div>
    </div>
  );
}
