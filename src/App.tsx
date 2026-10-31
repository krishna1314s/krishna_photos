import {useEffect} from 'react';
import {Footer, Header} from './components/Chrome';
import {Contact} from './components/Contact';
import {DayPath} from './components/DayPath';
import {Gallery} from './components/Gallery';
import {Hero} from './components/Hero';
import {Reel} from './components/Reel';
import {useReducedMotion} from './hooks/useReducedMotion';
import {startScroll} from './lib/scroll';

export default function App() {
  const reduced = useReducedMotion();
  useEffect(() => startScroll(reduced), [reduced]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Reel />
        <DayPath />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
