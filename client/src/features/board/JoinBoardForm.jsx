import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FieldError from '../../components/FieldError';
import ErrorBanner from '../../components/ErrorBanner';
import useFormErrors from '../../hooks/useFormErrors';
import { setSession } from '../../store/sessionSlice';
import { joinBoard } from '../../services/board';

const inputClasses =
  'w-full rounded-btn bg-surface border border-border px-4 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors duration-200';

const JoinBoardForm = ({ inviteToken, boardName }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    blockError,
    fieldErrors,
    setFieldErrors,
    clearFieldError,
    setBlockError,
    clearBlockError,
  } = useFormErrors();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearBlockError();
    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await joinBoard(inviteToken, { displayName, email });

      dispatch(setSession({
        id: result.participant.id,
        boardId: result.board.id,
        role: result.participant.role,
        displayName: result.participant.displayName,
      }));

      navigate(`/board/${result.board.id}`);
    } catch (err) {
      const mapped = {};
      let mappedAny = false;

      if (Array.isArray(err.issues)) {
        for (const issue of err.issues) {
          const field = Array.isArray(issue.path) ? issue.path[0] : null;
          if (field === 'displayName' || field === 'email') {
            mapped[field] = issue.message;
            mappedAny = true;
          }
        }
      }

      if (mappedAny) {
        setFieldErrors(mapped);
        setBlockError('Please fix the highlighted fields and try again.');
      } else {
        setFieldErrors({});
        setBlockError(err.message || 'Could not join board');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = Boolean(displayName.trim() && email.trim());

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-text-primary">
        Join {boardName || 'the board'}
      </h1>
      <p className="mt-2 font-sans text-text-muted">
        Enter your name and email to join.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <ErrorBanner message={blockError} onDismiss={clearBlockError} />

        <div>
          <label htmlFor="join-name" className="mb-1.5 block font-sans text-sm font-medium text-text-muted">
            Display name
          </label>
          <input
            id="join-name"
            type="text"
            required
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              clearFieldError('displayName');
            }}
            placeholder="e.g. Alex"
            className={inputClasses}
          />
          <FieldError message={fieldErrors.displayName} />
        </div>

        <div>
          <label htmlFor="join-email" className="mb-1.5 block font-sans text-sm font-medium text-text-muted">
            Email
          </label>
          <input
            id="join-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            placeholder="you@example.com"
            className={inputClasses}
          />
          <FieldError message={fieldErrors.email} />
          <p className="mt-1 font-sans text-xs text-text-muted">
            Used for recovery only — never shared with other participants.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isFormComplete || submitting}
          className={`flex w-full items-center justify-center gap-2 rounded-btn px-4 py-3 font-sans text-sm font-semibold transition-all duration-200 ${
            isFormComplete
              ? 'bg-accent text-background hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed'
              : 'bg-surface-2 text-text-muted/60 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            'Join board'
          )}
        </button>
      </form>
    </div>
  );
};

export default JoinBoardForm;