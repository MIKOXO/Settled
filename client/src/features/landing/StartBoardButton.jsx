import { Link } from 'react-router-dom';

const StartBoardButton = ({ className = '' }) => (
  <Link
    to="/create"
    className={`inline-flex items-center justify-center rounded-btn bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-background hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,107,74,0.25)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none ${className}`}
  >
    Start a board
  </Link>
);

export default StartBoardButton;
