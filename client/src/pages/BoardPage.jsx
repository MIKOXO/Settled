import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { initSocket } from '../services/socket';
import { fetchBoard, getMe } from '../services/board';
import { fetchOptions } from '../services/options';
import {
  setBoard,
  setOptions,
  setStatus,
  resetBoard,
} from '../store/boardSlice';
import { setSession } from '../store/sessionSlice';
import BoardHeader from '../features/board/BoardHeader';
import OptionsList from '../features/options/OptionsList';
import ProposeOptionForm from '../features/options/ProposeOptionForm';

const BoardPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.board.status);

  useSocket();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) {
        dispatch(resetBoard());
        dispatch(setStatus('loading'));
      }

      try {
        const [board, options, me] = await Promise.all([
          fetchBoard(boardId),
          fetchOptions(boardId),
          getMe(),
        ]);

        if (!cancelled) {
          if (me.participant && me.board) {
            dispatch(setSession({
              id: me.participant.id,
              boardId: me.board.id,
              role: me.participant.role,
              displayName: me.participant.displayName,
            }));
          }
          dispatch(setBoard(board));
          dispatch(setOptions(options.options));
          dispatch(setStatus('succeeded'));
          initSocket().connect();
        }
      } catch {
        if (!cancelled) {
          dispatch(resetBoard());
          dispatch(setStatus('failed'));
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [boardId, dispatch]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-4 font-sans text-sm text-text-muted">Loading board...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/15 font-heading text-xl font-bold text-error">
          !
        </div>
        <h1 className="mt-5 font-heading text-2xl font-bold text-text-primary">
          Couldn&apos;t load this board
        </h1>
        <p className="mt-3 font-sans text-text-muted">
          It may have been removed, or your session no longer has access.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-btn bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
            Settled
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <BoardHeader />
        <ProposeOptionForm />
        <OptionsList />
      </main>
    </div>
  );
};

export default BoardPage;