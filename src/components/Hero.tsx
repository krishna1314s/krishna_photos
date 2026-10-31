import {useEffect, useRef} from 'react';
import {hero, total} from '../content';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {easeOutCubic, lerp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * The opening. Three layers stacked and pinned, each moved at its own rate:
 *
 *   sky   the mirror selfie
 *   near  the photograph itself, keyed so light shows through its bright
 *         parts (the lantern's panes, the open sky) and the foliage is opaque
 *
 *   0.00 – 0.18  a veil of cosmic dust drifts off the lens
 *   0.04 – 0.50  the light rises behind the photograph
 *   0.10 – 0.50  the title resolves between the backdrop and the foreground
 *   0.70 – 1.00  everything tilts away upward and the page fades to black
 */

const STAGE_VH = 440;

type Mote = {x: number; y: number; r: number; s: number; a: number};

const FIT = 'absolute inset-0 size-full object-cover object-[64%_50%] md:object-[60%_30%]';

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const apronRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLParagraphElement>(null);
  const evRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const c = dustRef.current!;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = dustRef.current!;
    const ctx = canvas.getContext('2d')!;
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const motes: Mote[] = Array.from({length: 140}, () => ({x: rand(), y: rand(), r: 0.4 + rand() * 1.6, s: 0.3 + rand(), a: 0.2 + rand() * 0.6}));
    let lastP = -1;
    let lastTime = 0;

    const put = (el: HTMLElement | null, y: number, scale = 1, opacity = 1) => {
      if (!el) return;
      el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    return onFrame((time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      if (!root) return;
      const {p, rect} = pinProgress(root);
      if (rect.bottom < 0) return;

      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#dfe6f2';
        for (const m of motes) {
          if (!reducedRef.current) {
            m.x += 0.006 * m.s * dt;
            m.y -= 0.004 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.globalAlpha = m.a * veil;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.6) * h, m.r * (1 + p * 4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));
      const rise = easeOutCubic(range(p, 0.04, 0.5));

      veilRef.current!.style.opacity = String(veil);
      veilRef.current!.style.transform = `translate3d(0, ${-range(p, 0, 0.18) * 24}vh, 0) scale(${1 + range(p, 0, 0.18) * 0.25})`;
      canvas.style.opacity = String(veil);

      put(skyRef.current, lerp(0, -6, p), lerp(1.14, 1, settle));
      apronRef.current!.style.transform = `translate3d(0, ${(1 - exit) * 101}vh, 0)`;

      const tIn = easeOutCubic(range(p, 0.08, 0.24));
      const tOut = range(p, 0.42, 0.52);
      const title = titleRef.current!;
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.letterSpacing = `${lerp(0.6, 0.24, tIn)}em`;
      title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : '';

      hudRef.current!.style.opacity = String(range(p, 0.02, 0.1) * (1 - range(p, 0.62, 0.72)));
      frameRef.current!.textContent = `Frame ${String(Math.round(p * total)).padStart(3, '0')} / ${total}`;
      evRef.current!.textContent = `+${(rise * 3.2).toFixed(1)} EV`;
    });
  }, []);

  const cut = (name: 'sky') => (
    <picture>
      <source media="(max-width: 767px)" srcSet={`/layers/m/${name}.webp`} />
      <img src={`/layers/d/${name}.webp`} alt="" aria-hidden="true" className={FIT} decoding="async" fetchPriority="high" />
    </picture>
  );

  return (
    <section id="top" ref={rootRef} aria-label="Opening" className="relative" style={{height: `${STAGE_VH}svh`}}>
      <div className="sticky top-0 h-screen-s overflow-hidden bg-void">
        <div ref={skyRef} className="absolute inset-0 will-change-transform">
          {cut('sky')}
        </div>

        <div ref={titleRef} className="pointer-events-none absolute inset-x-0 top-[22%] z-[3] px-4 text-center md:top-[36%] md:right-auto md:left-[5vw] md:max-w-[44vw] md:px-0 md:text-left" style={{opacity: 0}}>
          <h1 className="font-display text-[clamp(1.75rem,9vw,2.75rem)] leading-[1.2] tracking-[0.24em] text-white uppercase [text-shadow:0_4px_40px_rgb(0_0_0/0.6)] md:text-[clamp(2rem,4.6vw,5rem)]">
            {hero.title}
          </h1>
          <p className="mt-4 font-mono text-label text-regolith/80 uppercase">{hero.kicker}</p>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/70 via-void/10 to-transparent max-md:bg-gradient-to-b max-md:from-void/60 max-md:to-void/20" />
        <div ref={apronRef} aria-hidden="true" className="absolute inset-0 z-[3] bg-void" style={{transform: 'translate3d(0,101vh,0)'}} />

        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[4]"
          style={{
            background:
              'radial-gradient(60% 50% at 30% 40%, rgba(170,184,210,0.55), transparent 70%), radial-gradient(50% 60% at 75% 60%, rgba(120,140,180,0.5), transparent 70%), radial-gradient(80% 80% at 50% 50%, rgba(20,26,40,0.85), rgba(5,7,12,0.95))',
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <p className="font-mono text-label text-regolith/80 uppercase">{hero.kicker}</p>
            <p className="mt-3 font-display text-[0.8125rem] tracking-[0.5em] text-white/90 uppercase" style={{marginRight: '-0.5em'}}>
              Scroll to clear the dust
            </p>
            <span aria-hidden="true" className="mt-6 inline-block animate-bounce text-regolith/70 motion-reduce:animate-none">
              ↓
            </span>
          </div>
        </div>
        <canvas ref={dustRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] size-full" />

        <div ref={hudRef} aria-hidden="true" className="pointer-events-none absolute inset-4 z-[6] font-mono text-[0.625rem] tracking-[0.14em] text-regolith/75 uppercase sm:inset-6 md:text-label" style={{opacity: 0}}>
          <div className="brackets absolute inset-0 text-regolith/40" />
          <div className="absolute top-16 left-3 space-y-1 md:top-20 md:left-4">
            <p ref={frameRef}>Frame 000 / {total}</p>
            <p className="text-regolith/50">Frames counted</p>
          </div>
          <div className="absolute top-16 right-3 space-y-1 text-right md:top-20 md:right-4">
            <p>
              Exposure <span ref={evRef} className="text-glow">+0.0 EV</span>
            </p>
            <p className="text-regolith/50">Light rising</p>
          </div>
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">{hero.site}</div>
          <div className="absolute right-3 bottom-3 flex items-center gap-2 md:right-4 md:bottom-4">
            Scroll <span className="inline-block animate-bounce motion-reduce:animate-none">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
