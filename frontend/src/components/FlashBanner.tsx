import { useEffect, useState } from "react";

const SLOT_MS = 4 * 60 * 60 * 1000; // bloques de 4 h (simulado)

function remainingMs() {
  const now = Date.now();
  return SLOT_MS - (now % SLOT_MS);
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** Banner de oferta flash con cuenta regresiva simulada (por bloques de 4 h). */
export default function FlashBanner() {
  const [left, setLeft] = useState(remainingMs());

  useEffect(() => {
    const id = window.setInterval(() => setLeft(remainingMs()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-nova-coral to-nova-primary px-4 py-3 text-[#1a1205] shadow-lg shadow-nova-coral/20">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-lg" aria-hidden="true">⚡</span>
        <p className="truncate text-sm font-bold">
          OFERTA FLASH <span className="font-semibold">· Envío gratis hoy</span>
        </p>
      </div>
      <p className="shrink-0 font-display text-sm font-bold tabular-nums" aria-live="off">
        {format(left)}
      </p>
    </div>
  );
}
