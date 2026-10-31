import {useEffect, useRef, useState} from 'react';
import {chapters, day, total} from '../content';
import {clamp, easeOutCubic, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * The sun's path across the day, drawn as you scroll. The section pins while
 * the four legs (morning, midday, golden hour, night) ink themselves one
 * after another, a sun riding the leg being drawn; the photograph counter
 * ticks up to the total as the day goes by.
 */
const SECTION_VH = 380;
const WINDOW = [0.06, 0.92] as const;

const X0 = 100;
const SPAN = 1000;
const BASE = 430;
const PEAK = 290;
const yAt = (t: number) => BASE - 4 * PEAK * t * (1 - t);

/** Four exact quadratic pieces of one parabola. */
const LEGS = [0, 1, 2, 3].map((i) => {
  const t0 = i / 4;
  const t1 = (i + 1) / 4;
  const x0 = X0 + t0 * SPAN;
  const x1 = X0 + t1 * SPAN;
  const slope = (-4 * PEAK * (1 - 2 * t0)) / SPAN;
  const cy = yAt(t0) + (slope * (x1 - x0)) / 2;
  return `M${x0} ${yAt(t0)} Q ${(x0 + x1) / 2} ${cy} ${x1} ${yAt(t1)}`;
});
const COLORS = ['#e8ecf5', '#8fc4ff', '#ffb066', '#8aa0e0'];

export function DayPath() {
  const rootRef = useRef<HTMLElement>(null);
  const legRefs = useRef<SVGPathElement[]>([]);
  const sunRef = useRef<SVGGElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [leg, setLeg] = useState(0);

  useEffect(() => {
    let lastP = -1;
    let current = 0;
    return onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const u = range(p, ...WINDOW) * LEGS.length;
      const s = clamp(Math.floor(u), 0, LEGS.length - 1);
      if (s !== current) {
        current = s;
        setLeg(s);
      }
      legRefs.current.forEach((path, i) => {
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          sunRef.current!.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        }
      });
      countRef.current!.textContent = String(Math.round(easeOutCubic(range(p, ...WINDOW)) * total));
    });
  }, []);

  const c = chapters[leg];

  return (
    <section ref={rootRef} id="day" aria-labelledby="day-title" className="relative bg-void" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col overflow-hidden px-4 pt-20 pb-8 sm:px-6 md:px-[6vw] md:pt-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-label text-glow uppercase">{day.eyebrow}</p>
            <h2 id="day-title" className="mt-3 max-w-[20ch] font-display text-display text-white">
              {day.heading}
            </h2>
          </div>
          <p className="font-mono text-label text-regolith/60 uppercase" aria-live="off">
            Photographs counted <span ref={countRef} className="text-white tabular-nums">0</span> / {total}
          </p>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center">
          <svg viewBox="0 0 1200 600" className="h-auto max-h-full w-full" role="img" aria-label="The path of the sun across one day, drawn in four legs: morning, midday, golden hour and night.">
            <defs>
              <radialGradient id="sun-glow">
                <stop offset="0" stopColor="#ffb870" stopOpacity="0.55" />
                <stop offset="1" stopColor="#ffb870" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g fill="#fff">
              {Array.from({length: 70}, (_, i) => (
                <circle key={i} cx={(i * 173) % 1200} cy={(i * 97) % 380} r={i % 7 === 0 ? 1.4 : 0.7} opacity={0.12 + ((i * 37) % 50) / 120} />
              ))}
            </g>
            <line x1="40" y1={BASE + 30} x2="1160" y2={BASE + 30} stroke="#fff" strokeOpacity="0.15" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line x1={X0 + (i * SPAN) / 4} y1={BASE + 24} x2={X0 + (i * SPAN) / 4} y2={BASE + 36} stroke="#fff" strokeOpacity="0.35" />
              </g>
            ))}
            {LEGS.map((d, i) => (
              <path key={`g${i}`} d={d} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 6" />
            ))}
            {LEGS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  if (el) legRefs.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke={COLORS[i]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
              />
            ))}
            <g ref={sunRef} transform={`translate(${X0} ${BASE})`}>
              <circle r="34" fill="url(#sun-glow)" />
              <circle r="9" fill="#ffe6bf" />
            </g>
            <g fontFamily="IBM Plex Mono, monospace" fontSize="13" letterSpacing="2" fill="#8b909b" textAnchor="middle">
              {chapters.map((ch, i) => (
                <text key={ch.id} x={X0 + ((i + 0.5) * SPAN) / 4} y={BASE + 62}>
                  {ch.name.toUpperCase()}
                </text>
              ))}
            </g>
          </svg>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-5 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
          <p className="font-mono text-label text-glow uppercase">
            Chapter {leg + 1}/{chapters.length} · {c.photos.length} frames
          </p>
          <div key={leg} className="animate-[leg-in_0.6s_cubic-bezier(0.2,0.7,0.1,1)]" aria-live="polite">
            <h3 className="font-display text-[1.125rem] tracking-[0.08em] text-white uppercase md:text-[1.375rem]">{c.name}</h3>
            <p className="mt-1.5 max-w-[40rem] text-body text-regolith/70">{c.line}</p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {chapters.map((_, i) => (
              <span key={i} className={`h-1 w-8 rounded-full transition-colors duration-500 ${i <= leg ? 'bg-glow' : 'bg-white/15'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
