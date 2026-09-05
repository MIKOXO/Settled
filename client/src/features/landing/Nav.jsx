import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StartBoardButton from './StartBoardButton';

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setShowCta(y > 500);

      if (y < 40) {
        setHidden(false);
      } else if (y - lastY > 8) {
        setHidden(true);
      } else if (lastY - y > 8) {
        setHidden(false);
      }

      lastY = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'border-border bg-surface/80 backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Settled
        </Link>
        <div
          className={`transition-all duration-300 ${
            showCta ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
        >
          <StartBoardButton />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
