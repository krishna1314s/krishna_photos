import photos from './photos.json';

export type Img = {src: string; w: number; h: number; alt: string};
export type Chapter = {id: string; name: string; line: string; photos: string[]};

export const imgs = photos.imgs as Record<string, Img>;
export const chapters = photos.chapters as Chapter[];
export const meta = photos.meta;
export const total = chapters.reduce((n, c) => n + c.photos.length, 0);

export const brand = {
  name: meta.name,
  wordmark: meta.name.toUpperCase(),
  email: 'itzkrishna1314@gmail.com',
  phone: '8072790745',
  phoneHref: 'tel:+918072790745',
};

export const nav = [
  {label: 'Reel', href: '#reel'},
  {label: 'Day', href: '#day'},
  {label: 'Gallery', href: '#gallery'},
  {label: 'Contact', href: '#contact'},
];

export const hero = {
  title: 'Behind the camera',
  kicker: 'Photographs from everyday days',
  site: 'Photography portfolio',
};

export const intro = {
  eyebrow: 'The reel',
  heading: 'One day, photographed in four lights.',
  body: meta.intro,
};

/** One still per chapter for the reel. */
export const reelPicks: Record<string, string> = {morning: '074394', midday: '128012', golden: '400004', night: '400001'};

export const day = {
  eyebrow: 'The day',
  heading: `${total} photographs, drawn as you scroll.`,
};

export const gallery = {
  eyebrow: 'Gallery',
  heading: 'Four chapters.',
  note: 'Tap any frame to view it full screen.',
};

export const contact = {
  eyebrow: 'Behind the camera',
  heading: 'Krishna',
  body: 'Prints, collaborations or just a note — call or write and I’ll reply.',
};
