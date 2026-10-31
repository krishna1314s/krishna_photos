import {useEffect, useRef} from 'react';
import {chapters, imgs, intro, reelPicks} from '../content';
import {clamp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * The four chapters as a reel of stills. The section pins and the reel slides
 * sideways with the scroll; the frame nearest the focus line is in full
 * colour, the rest dim back, and each picture drifts against its frame.
 */
const SECTION_VH = 340;

export function Reel() {
  const rootRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      const view = viewRef.current;
      if (!root || !track || !view) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const k = range(p, 0.04, 0.96);
      const travel = Math.max(0, track.scrollWidth - view.clientWidth);
      const vr = view.getBoundingClientRect();
      track.style.transform = `translate3d(${-k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cardRefs.current.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - (vr.left + vr.width * 0.4)) / vw;
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        imgRefs.current[i].style.transform = `translate3d(${off * -60}px, 0, 0) scale(1.15)`;
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      barRef.current!.style.transform = `scaleX(${k})`;
      countRef.current!.textContent = `0${nearest + 1}`;
    });
  }, []);

  return (
    <section ref={rootRef} id="reel" aria-labelledby="reel-title" className="relative z-[1] -mt-[100svh] bg-void" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col justify-center overflow-hidden pt-16 md:flex-row md:items-center md:pt-0">
        <div className="relative z-10 shrink-0 px-4 sm:px-6 md:w-[38vw] md:pl-[6vw] md:pr-6 lg:pr-12">
          <p className="font-mono text-label text-glow uppercase">{intro.eyebrow}</p>
          <h2 id="reel-title" className="mt-4 font-display text-[clamp(1.75rem,8vw,2.5rem)] leading-[1.1] text-white md:text-[clamp(1.15rem,2.3vw,3rem)]">
            {intro.heading}
          </h2>
          <p className="mt-5 max-w-[26rem] text-body text-regolith/70 max-md:hidden">{intro.body}</p>
          <div className="mt-8 flex items-center gap-4 font-mono text-label text-regolith/60 uppercase max-md:hidden" aria-hidden="true">
            <span>
              <span ref={countRef} className="text-white">
                01
              </span>{' '}
              / 0{chapters.length}
            </span>
            <span className="relative h-px w-32 bg-white/15">
              <span ref={barRef} className="absolute inset-0 origin-left bg-glow" style={{transform: 'scaleX(0)'}} />
            </span>
          </div>
        </div>

        <div ref={viewRef} className="mt-8 min-w-0 overflow-hidden py-3 md:mt-0 md:flex-1 md:pl-6">
        <ol ref={trackRef} className="flex w-max gap-5 pr-[6vw] pl-4 will-change-transform sm:pl-6 md:gap-7 md:pl-0">
          {chapters.map((c, i) => {
            const m = imgs[reelPicks[c.id]];
            return (
              <li
                key={c.id}
                ref={(el) => {
                  if (el) cardRefs.current[i] = el;
                }}
                className="w-[70vw] shrink-0 origin-bottom sm:w-[44vw] md:w-[clamp(16rem,24vw,23rem)]"
              >
                <figure>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-void-2">
                    <img
                      ref={(el) => {
                        if (el) imgRefs.current[i] = el;
                      }}
                      src={m.src}
                      alt={m.alt}
                      width={m.w}
                      height={m.h}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover will-change-transform"
                    />
                    <span className="absolute top-3 left-3 rounded-[3px] bg-void/70 px-2 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-white uppercase backdrop-blur">
                      {c.photos.length} frames
                    </span>
                  </div>
                  <figcaption className="mt-4 flex gap-4">
                    <span className="font-mono text-label text-glow">0{i + 1}</span>
                    <span>
                      <span className="block font-display text-[0.9375rem] tracking-[0.08em] text-white uppercase">{c.name}</span>
                      <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-regolith/65">{c.line}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ol>
        </div>
      </div>
    </section>
  );
}
