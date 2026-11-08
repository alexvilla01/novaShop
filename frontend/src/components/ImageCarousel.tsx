import { useEffect, useState } from "react";

interface Props {
  images: string[];
  name: string;
}

/** Carrusel de la landing: imagen grande first-party, thumbs y controles. */
export default function ImageCarousel({ images, name }: Props) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + total) % total);
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900">
        <div className="flex aspect-square w-full items-center justify-center sm:aspect-[4/3]">
          {total > 0 ? (
            <img
              src={images[index]}
              alt={`${name} — foto ${index + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3" aria-hidden="true">
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 font-display text-4xl font-bold text-nova-primary ring-1 ring-white/10">
                {name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-nova-ink-muted">
                Foto del producto
              </span>
            </div>
          )}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "w-5 bg-nova-primary" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Miniatura ${i + 1}`}
              className={`shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                i === index ? "ring-nova-primary" : "ring-white/10 hover:ring-white/30"
              }`}
            >
              <img src={src} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
