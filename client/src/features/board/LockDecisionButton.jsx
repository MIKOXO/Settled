import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Lock, Loader2 } from 'lucide-react';
import { lockDecision } from '../../services/board';
import { setBoard } from '../../store/boardSlice';

const LockDecisionButton = () => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const board = useSelector((state) => state.board.board);
  const options = useSelector((state) => state.board.options);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (session?.role !== 'owner' || !board || board.status === 'decided' || options.length === 0) {
    return null;
  }

  const leadingOptions = options.filter((o) => o.isLeading);
  const defaultOption = leadingOptions[0] ?? options[0];
  const value = selectedId || defaultOption?.id || '';

  const handleLock = async () => {
    if (!value) return;

    setError(null);
    setSubmitting(true);
    try {
      const result = await lockDecision(board.id, value);
      dispatch(setBoard(result));
      setOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to lock decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-btn bg-accent px-3.5 py-2 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
      >
        <Lock className="h-4 w-4" />
        Lock decision
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-card border border-border bg-surface-2 p-4 shadow-xl shadow-black/40">
          <p className="mb-3 font-sans text-xs text-text-muted">
            Pick the option to lock in as the final decision.
          </p>

          <select
            value={value}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-btn border border-border bg-surface px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors duration-200"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
                {o.isLeading ? ' (leading)' : ''}
              </option>
            ))}
          </select>

          {error && (
            <p className="mt-2 rounded-btn bg-error/10 px-3 py-2 font-sans text-sm text-error">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLock}
            disabled={submitting || !value}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-4 py-2 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {submitting ? 'Locking...' : 'Confirm lock'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LockDecisionButton;
