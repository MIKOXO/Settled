import { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Lock, Loader2 } from 'lucide-react';
import { lockDecision } from '../../services/board';
import { setBoard } from '../../store/boardSlice';
import useDismissable from '../../hooks/useDismissable';

const countLabel = (count, singular, plural) => {
  if (count === 0) return `no ${plural}`;
  return `${count} ${count === 1 ? singular : plural}`;
};

// Ties are the normal path — every tied option is "leading", so the summary
// counts them instead of naming a single title the owner never picked.
const leadingSummary = (leadingOptions) => {
  if (leadingOptions.length > 1) {
    return `${leadingOptions.length} options are tied for the lead`;
  }
  return `${leadingOptions[0].title} is leading`;
};

const LockDecisionButton = () => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const board = useSelector((state) => state.board.board);
  const options = useSelector((state) => state.board.options);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [overrideSeen, setOverrideSeen] = useState(false);
  const rootRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useDismissable(rootRef, open, () => setOpen(false));

  if (session?.role !== 'owner' || !board || board.status === 'decided' || options.length === 0) {
    return null;
  }

  const leadingOptions = options.filter((o) => o.isLeading);
  const defaultOption = leadingOptions[0] ?? options[0];
  const value = selectedId || defaultOption?.id || '';

  // Overriding is only possible once there's a choice to override: a single
  // option is trivially leading, and with no votes every option ties, so any
  // pick is already a leading one.
  const canOverride = options.length > 1 && leadingOptions.length < options.length;
  const selectedOption = options.find((o) => o.id === value);
  const isOverride = canOverride && !!selectedOption && !selectedOption.isLeading;
  // The score quoted is the leading option's — it's what the owner is
  // overriding. Tied options share a score by definition, so the first one
  // speaks for the whole tied set.
  const { likesCount = 0, dislikesCount = 0 } = leadingOptions[0] ?? {};
  const scoreLabel = `${countLabel(likesCount, 'like', 'likes')} and ${countLabel(
    dislikesCount,
    'dislike',
    'dislikes',
  )}`;

  const handleLock = async () => {
    if (!value) return;

    setOverrideSeen(false);
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

      <AnimatePresence>
        {open && (
          <motion.div
            // Same settle as the Invite popover and Manage disclosure — every
            // header panel grows out of its trigger the same way.
            initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 z-30 mt-2 w-72 origin-top-right rounded-card border border-border bg-surface-2 p-4 shadow-xl shadow-black/40"
          >
            <p className="mb-3 font-sans text-xs text-text-muted">
              Pick the option to lock in as the final decision.
            </p>

            <select
              value={value}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setOverrideSeen(false);
              }}
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

            {isOverride && (
              <div className="mt-3 rounded-btn border border-error/40 bg-error/10 px-3 py-2.5">
                <p className="flex items-start gap-2 font-sans text-sm leading-relaxed text-error">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {leadingSummary(leadingOptions)} with {scoreLabel}. Lock in{' '}
                    {selectedOption.title} instead?
                  </span>
                </p>

                <label className="mt-2.5 flex cursor-pointer items-start gap-2 font-sans text-xs leading-relaxed text-text-muted">
                  <input
                    type="checkbox"
                    checked={overrideSeen}
                    onChange={(e) => setOverrideSeen(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-error"
                  />
                  I understand this isn't the leading option
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={handleLock}
              disabled={submitting || !value || (isOverride && !overrideSeen)}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-btn px-4 py-2 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-60 ${
                isOverride ? 'bg-error' : 'bg-accent'
              }`}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {submitting
                ? 'Locking...'
                : isOverride
                  ? 'Override and lock'
                  : 'Confirm lock'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LockDecisionButton;
