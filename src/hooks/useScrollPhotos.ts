import {useEffect, type RefObject} from 'react';
import {clamp, easeOutCubic, lerp, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * Scroll-scrubbed motion for every `[data-photo]` frame inside the ref'd section.
 * As a frame travels up the viewport it rises, un-tilts and un-zooms into place
 * (the "enter" phase), and its picture drifts against the frame (parallax).
 * Styles are written straight to the DOM from the shared frame loop.
 */
export function useScrollPhotos(ref: RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    if (reduced) return;
    return onFrame(() => {
      const root = ref.current;
      if (!root) return;
      const vh = window.innerHeight;
      const sr = root.getBoundingClientRect();
      if (sr.bottom < -vh || sr.top > vh * 2) return;
      root.querySelectorAll<HTMLElement>('[data-photo]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) return;
        // 0 when the frame's top is at the viewport bottom, 1 when it's 30% up the screen
        const enter = easeOutCubic(range(r.top, vh, vh * 0.7));
        // -1 → 1 as the frame's centre crosses the viewport
        const mid = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
        const side = el.dataset.side === 'r' ? 1 : -1;
        el.style.transform = `translate3d(0, ${lerp(60, 0, enter)}px, 0) rotate(${lerp(side * 2.2, 0, enter)}deg) scale(${lerp(0.9, 1, enter)})`;
        el.style.opacity = String(lerp(0, 1, clamp(enter * 1.4)));
        el.style.clipPath = `inset(0 0 ${lerp(18, 0, enter)}% 0 round 6px)`;
        const img = el.querySelector<HTMLElement>('img');
        if (img) img.style.transform = `translate3d(0, ${mid * -6}%, 0) scale(${lerp(1.28, 1.14, enter)})`;
      });
    });
  }, [ref, reduced]);
}
