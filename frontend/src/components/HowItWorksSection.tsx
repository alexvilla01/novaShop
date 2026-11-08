const steps = [
  {
    title: "Toca el botón de WhatsApp",
    text: "Te lleva directo a nuestro chat con tu producto ya seleccionado.",
  },
  {
    title: "Confirmas con el asistente IA",
    text: "En segundos valida stock, dirección y método de envío. Sin esperas.",
  },
  {
    title: "Pago contra entrega / envío seguro",
    text: "Recibes tu pedido y pagas al entregar. Seguimiento incluido.",
  },
];

/** Cómo funciona: 3 pasos sencillos hacia la compra. */
export default function HowItWorksSection() {
  return (
    <section aria-labelledby="como-funciona" className="mt-10">
      <h2 id="como-funciona" className="font-display text-xl font-bold sm:text-2xl">
        Cómo funciona
      </h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="glass-panel relative rounded-2xl p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-nova-primary to-nova-coral font-display text-sm font-bold text-[#1a1205]">
              {i + 1}
            </span>
            <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-nova-ink-muted">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center text-xs text-nova-ink-muted">
        Sin tarjetas, sin cuentas, sin carritos. Solo WhatsApp.
      </p>
    </section>
  );
}
