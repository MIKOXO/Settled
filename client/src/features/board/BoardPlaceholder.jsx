import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../store/sessionSlice';

const BoardPlaceholder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const session = useSelector((state) => state.session);

  const handleLeave = () => {
    dispatch(clearSession());
    navigate('/');
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
        <span className="font-heading text-2xl font-bold text-accent">S</span>
      </div>

      <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary">
        Board view
      </h1>
      <p className="mt-2 font-sans text-text-muted">
        Options, voting, and map arrive in Module 4.
      </p>

      {session && (
        <div className="mt-6 rounded-card bg-surface border border-border p-4 text-left">
          <p className="font-sans text-sm text-text-muted">
            Signed in as <span className="font-semibold text-text-primary">{session.displayName}</span>
          </p>
          <p className="mt-1 font-sans text-sm text-text-muted">
            Role: <span className="font-semibold text-text-primary capitalize">{session.role}</span>
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleLeave}
        className="mt-8 rounded-btn bg-surface border border-border px-5 py-2.5 font-sans text-sm font-medium text-text-muted hover:text-text-primary hover:border-accent transition-all duration-200"
      >
        Leave board
      </button>
    </div>
  );
};

export default BoardPlaceholder;
