import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSession } from '../../store/sessionSlice';
import { recover } from '../../services/board';
import { Loader2 } from 'lucide-react';

const RecoverConfirmPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [boardId, setBoardId] = useState(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const confirmRecovery = async () => {
      try {
        const result = await recover(token);

        if (cancelled) return;

        dispatch(setSession({
          id: result.participant.id,
          boardId: result.board.id,
          role: result.participant.role,
          displayName: result.participant.displayName,
        }));

        setBoardId(result.board.id);
        setStatus('success');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    confirmRecovery();

    return () => { cancelled = true; };
  }, [token, dispatch]);

  useEffect(() => {
    if (status === 'success' && boardId) {
      navigate(`/board/${boardId}`, { replace: true });
    }
  }, [status, boardId, navigate]);

  if (status === 'loading') {
    return (
      <div className="mx-auto flex flex-col items-center px-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-4 font-sans text-text-muted">Confirming recovery...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/15">
          <span className="font-heading text-2xl font-bold text-error">!</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Link expired
        </h1>
        <p className="mt-3 font-sans text-text-muted">
          This recovery link is invalid or has expired. Request a new one to get back in.
        </p>
        <Link
          to="/recover"
          className="mt-8 inline-flex rounded-btn bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-background hover:brightness-110 transition-all duration-200"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return null;
};

export default RecoverConfirmPage;
