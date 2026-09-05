import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border">
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-sm font-semibold text-text-primary"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            Settled
          </Link>
          <p className="mt-1 font-sans text-xs text-text-muted">A board, then a decision.</p>
        </div>
        <nav className="flex gap-6">
          <a
            href="#how-it-works"
            className="font-sans text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
          >
            How it works
          </a>
          <a
            href="#features"
            className="font-sans text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
          >
            Features
          </a>
        </nav>
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <p className="font-sans text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Settled
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
