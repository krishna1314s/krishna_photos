import {brand, contact} from '../content';
import {useReveals} from '../hooks/useReveals';

/** Contact. Centred details; no form. */
export function Contact() {
  const ref = useReveals<HTMLElement>();

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-void px-4 pb-28 sm:px-6 md:px-[6vw] md:pb-40">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[62vw] left-1/2 size-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,184,112,0.35),rgba(255,184,112,0.05)_55%,transparent_70%)]" />
      <div className="relative border-t border-white/10 pt-20 md:pt-28">
        <div data-reveal className="mx-auto flex max-w-[34rem] flex-col items-center text-center">
          <figure className="w-full overflow-hidden rounded-[8px] ring-1 ring-white/10">
            <img src="/images/portrait.jpg" width={1325} height={1146} alt="Self-portrait in black and white, face hidden behind a phone" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
          </figure>
          <p className="mt-8 font-mono text-label text-glow uppercase">{contact.eyebrow}</p>
          <h2 id="contact-title" className="mt-4 font-display text-display text-white">
            {contact.heading}
          </h2>
          <p className="mt-5 text-body text-regolith/70">{contact.body}</p>
          <ul className="mt-6 space-y-2 font-mono text-[0.8125rem] tracking-[0.08em] text-white">
            <li>
              <a href={brand.phoneHref} className="hover:text-glow">{brand.phone}</a>
            </li>
            <li>
              <a href={`mailto:${brand.email}`} className="hover:text-glow">{brand.email}</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
