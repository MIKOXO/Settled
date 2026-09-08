import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import JoinBoardForm from '../features/board/JoinBoardForm';
import { getMe } from '../services/board';
import { Loader2 } from 'lucide-react';

const JoinBoardPage = () => {
  const { inviteToken } = useParams();

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [boardName, setBoardName] = useState('');

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const me = await getMe();

        if (cancelled) return;

        // Session exists for a different board → show join form for this new board
        if (me.board) {
          setBoardName(me.board.name);
        }
        // Always show the join form — the user is visiting a NEW invite link
        // even if they already have a session for another board
        setShowForm(true);
      } catch {
        if (!cancelled) setShowForm(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkSession();

    return () => { cancelled = true; };
  }, []);

  return (
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
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="mt-4 font-sans text-text-muted">Loading...</p>
          </div>
        ) : (
          showForm && (
            <JoinBoardForm
              inviteToken={inviteToken}
              boardName={boardName}
            />
          )
        )}
      </main>
    </div>
  );
};

export default JoinBoardPage;
