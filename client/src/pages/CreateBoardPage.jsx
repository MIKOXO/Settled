import { Link } from 'react-router-dom';
import CreateBoardForm from '../features/board/CreateBoardForm';

const CreateBoardPage = () => (
  <div className="min-h-screen bg-background">
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
          Settled
        </Link>
      </div>
    </nav>
    <main>
      <CreateBoardForm />
    </main>
  </div>
);

export default CreateBoardPage;
