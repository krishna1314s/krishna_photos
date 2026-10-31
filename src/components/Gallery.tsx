import {useEffect, useRef, useState} from 'react';
import {chapters, gallery, imgs} from '../content';
import {useReveals} from '../hooks/useReveals';

/** Chapter cards (each carries its size as orbit rings) filter the full gallery; every frame opens full screen. */
export function Gallery() {
  const ref = useReveals<HTMLElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<string>('all');
  const [cur, setCur] = useState(0);

  const ids = (tab === 'all' ? chapters.flatMap((c) => c.photos) : chapters.find((c) => c.id === tab)!.photos).slice();
  const wide = ids.filter((id) => imgs[id].w / imgs[id].h > 1.4);
  const tall = ids.filter((id) => !wide.includes(id));
  const order = [...tall, ...wide];

  const open = (i: number) => {
    setCur(i);
    dialogRef.current?.showModal();
  };
  const step = (d: number) => setCur((c) => (c + d + order.length) % order.length);

  useEffect(() => {
    const dlg = dialogRef.current!;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    dlg.addEventListener('keydown', onKey);
    return () => dlg.removeEventListener('keydown', onKey);
  });

  const pick = (id: string) => {
    setTab(id);
    gridRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const fig = (id: string, i: number, feature: boolean) => {
    const m = imgs[id];
    return (
      <figure key={id} data-reveal className={feature ? 'col-span-full' : 'mb-3 break-inside-avoid md:mb-4'}>
        <button type="button" onClick={() => open(i)} aria-label={`Open photo: ${m.alt}`} className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-[6px] bg-void-2 ${feature ? 'aspect-[2576/1142]' : ''}`} style={feature ? undefined : {aspectRatio: `${m.w}/${m.h}`}}>
          <img src={m.src} width={m.w} height={m.h} alt={m.alt} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
          {feature && (
            <>
              <span className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                <span className="rounded-[3px] bg-void/70 px-2 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-white uppercase backdrop-blur">Featured frame</span>
                <span className="mt-3 block max-w-[18ch] font-display text-[1.25rem] text-white md:text-[2.25rem]">{m.alt}</span>
              </span>
            </>
          )}
        </button>
        {!feature && <figcaption className="mt-2 text-[0.8125rem] leading-snug text-regolith/55">{m.alt}</figcaption>}
      </figure>
    );
  };

  const cur_ = imgs[order[cur]];

  return (
    <section ref={ref} id="gallery" aria-labelledby="gallery-title" className="relative bg-void px-4 py-28 sm:px-6 md:px-[6vw] md:py-40">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
        <div>
          <p className="font-mono text-label text-glow uppercase">{gallery.eyebrow}</p>
          <h2 id="gallery-title" className="mt-4 font-display text-display text-white">
            {gallery.heading}
          </h2>
        </div>
        <p className="font-mono text-label text-regolith/50 uppercase">{gallery.note}</p>
      </div>

      <ol className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 md:grid-cols-4 md:gap-5">
        {chapters.map((c, i) => (
          <li key={c.id} data-reveal style={{transitionDelay: `${i * 110}ms`}}>
            <button
              type="button"
              onClick={() => pick(c.id)}
              aria-pressed={tab === c.id}
              className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[8px] p-6 text-left ring-1 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 md:p-7 ${
                tab === c.id ? 'bg-void-2 ring-glow/60 hover:shadow-[0_30px_80px_-30px_rgb(255_184_112/0.45)]' : 'bg-void-2/60 ring-white/10 hover:ring-white/25'
              }`}
            >
              <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -top-10 -right-10 size-44 text-white/10 transition-transform duration-[1.2s] group-hover:rotate-45">
                {Array.from({length: Math.ceil(c.photos.length / 3)}, (_, k) => (
                  <ellipse key={k} cx="100" cy="100" rx={40 + k * 14} ry={18 + k * 6} fill="none" stroke="currentColor" transform={`rotate(${-20 + k * 14} 100 100)`} />
                ))}
                <circle cx="100" cy="100" r="9" fill="currentColor" />
              </svg>
              <span className="font-mono text-label text-glow">0{i + 1}</span>
              <span className="mt-4 font-display text-[1.125rem] tracking-[0.14em] text-white uppercase">{c.name}</span>
              <span className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-[3rem] leading-none text-white">{c.photos.length}</span>
                <span className="font-mono text-label text-regolith/60 uppercase">frames</span>
              </span>
              <span className="mt-5 border-t border-white/10 pt-4 text-[0.875rem] text-regolith/70">{c.line}</span>
            </button>
          </li>
        ))}
      </ol>

      <div ref={gridRef} className="mt-20 scroll-mt-24 md:mt-28">
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by chapter">
          {[{id: 'all', name: 'All'}, ...chapters].map((c) => (
            <button key={c.id} type="button" onClick={() => setTab(c.id)} aria-pressed={tab === c.id} className={`rounded-full px-4 py-2 font-mono text-label uppercase transition-colors ${tab === c.id ? 'bg-white text-void' : 'text-white ring-1 ring-white/25 hover:bg-white/10'}`}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="columns-1 gap-3 sm:columns-2 md:columns-3 md:gap-4">{tall.map((id, i) => fig(id, i, false))}</div>
        {wide.length > 0 && <div className="mt-3 grid gap-3 md:mt-4 md:gap-4">{wide.map((id, i) => fig(id, tall.length + i, true))}</div>}
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-4 text-white backdrop:bg-void/95 backdrop:backdrop-blur-md open:flex open:flex-col open:items-center open:justify-center open:gap-3"
      >
        <button type="button" aria-label="Close" onClick={() => dialogRef.current?.close()} className="absolute top-4 right-4 size-10 rounded-full border border-white/50 text-xl">×</button>
        <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="absolute top-1/2 left-4 size-10 -translate-y-1/2 rounded-full border border-white/50 text-xl">‹</button>
        <button type="button" aria-label="Next photo" onClick={() => step(1)} className="absolute top-1/2 right-4 size-10 -translate-y-1/2 rounded-full border border-white/50 text-xl">›</button>
        {cur_ && <img src={cur_.src} alt={cur_.alt} className="max-h-[calc(100dvh-6.5rem)] max-w-full rounded-[2px] object-contain" />}
        <p className="flex gap-4 font-mono text-label text-white/80 uppercase">
          <span>
            {cur + 1} / {order.length}
          </span>
          <span className="normal-case">{cur_?.alt}</span>
        </p>
      </dialog>
    </section>
  );
}
