const benefits = [
  {
    title: "Calidad que se siente",
    text: "Materiales duraderos y acabados premium, listos para el uso diario.",
    icon: (
      <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8L12 3Z" />
    ),
  },
  {
    title: "Compra 100% segura",
    text: "Confirmas por WhatsApp con una persona real. Sin tarjetas ni datos bancarios.",
    icon: (
      <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3Zm-1.2 12.2 5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3Z" />
    ),
  },
  {
    title: "Envío rápido y protegido",
    text: "Seguimiento de tu pedido y entrega asegurada en todo el país.",
    icon: (
      <path d="M3 7h11v8H3V7Zm12 3h3.5L21 13v2h-6v-5ZM6 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    ),
  },
];

/** Bloque de beneficios: 3 tarjetas glassmorphism con iconos minimalistas. */
export default function BenefitsGrid() {
  return (
    <section aria-labelledby="beneficios" className="mt-10">
      <h2 id="beneficios" className="font-display text-xl font-bold sm:text-2xl">
        Por qué lo vas a amar
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {benefits.map((b) => (
          <div key={b.title} className="glass-panel rounded-2xl p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-nova-aurora/10 text-nova-aurora ring-1 ring-nova-aurora/20">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                {b.icon}
              </svg>
            </span>
            <h3 className="mt-3 font-display text-base font-semibold">{b.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-nova-ink-muted">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
