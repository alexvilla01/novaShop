const reviews = [
  {
    name: "Mariana G.",
    initials: "MG",
    text: "Llegó en 2 días y la calidad superó lo que esperaba por el precio. Cerré todo por WhatsApp en 5 minutos.",
  },
  {
    name: "Luis R.",
    initials: "LR",
    text: "Excelente atención. Me confirmaron stock al instante y pagué contra entrega sin complicaciones.",
  },
  {
    name: "Andrea T.",
    initials: "AT",
    text: "Lo vi en Instagram, desconfiaba, pero el pedido llegó perfecto y bien empacado. Ya pedí otro.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-nova-primary" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8L12 3Z" />
        </svg>
      ))}
    </div>
  );
}

/** Prueba social: reseñas cortas con estrellas y compra verificada. */
export default function ReviewsSection() {
  return (
    <section aria-labelledby="resenas" className="mt-10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="resenas" className="font-display text-xl font-bold sm:text-2xl">
          Lo que dicen los compradores
        </h2>
        <p className="text-sm text-nova-ink-muted">4.9/5 · 127 reseñas</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.name} className="glass-panel rounded-2xl p-4">
            <Stars />
            <blockquote className="mt-2 text-sm leading-relaxed text-nova-ink">
              “{r.text}”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nova-aurora/15 text-xs font-bold text-nova-aurora">
                {r.initials}
              </span>
              <span className="text-sm font-medium">{r.name}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-nova-teal">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M12 2l2.3 2.1 3.1-.4 1.2 2.9 2.9 1.2-.4 3.1L23 13l-2.1 2.3.4 3.1-2.9 1.2-1.2 2.9-3.1-.4L12 24l-2.3-2.1-3.1.4-1.2-2.9-2.9-1.2.4-3.1L1 13l2.1-2.3-.4-3.1 2.9-1.2 1.2-2.9 3.1.4L12 2Zm-1.2 14.2 5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3Z" />
                </svg>
                Compra verificada
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
