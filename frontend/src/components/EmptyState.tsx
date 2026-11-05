interface Props {
  title?: string;
  message: string;
}

/** Estado vacío amigable (FR-002). */
export default function EmptyState({ title = "Sin productos en esta categoría", message }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-nova-surface px-6 py-16 text-center ring-1 ring-black/5">
      <p className="text-4xl" aria-hidden="true">🧺</p>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-nova-ink-muted">{message}</p>
    </div>
  );
}
