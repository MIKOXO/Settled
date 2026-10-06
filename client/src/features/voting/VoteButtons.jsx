import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { castVote, removeVote } from '../../services/votes';
import { applyVoteUpdate } from '../../store/boardSlice';

const nextCounts = (option, value) => {
  let likesCount = option.likesCount;
  let dislikesCount = option.dislikesCount;

  if (option.vote === 'like') likesCount = Math.max(0, likesCount - 1);
  if (option.vote === 'dislike') dislikesCount = Math.max(0, dislikesCount - 1);

  if (value === 'like') likesCount += 1;
  if (value === 'dislike') dislikesCount += 1;

  return { likesCount, dislikesCount, score: likesCount - dislikesCount };
};

const VoteButton = ({
  value,
  count,
  active,
  errored,
  locked,
  onClick,
}) => {
  const Icon = value === 'like' ? ThumbsUp : ThumbsDown;
  const reduceMotion = useReducedMotion();

  // A decided board still shows the tally — including your own past reaction —
  // it just can't be changed. In-flight requests don't disable the buttons:
  // clicks during flight queue as intent (see VoteButtons).
  const title = locked
    ? 'Decision locked — voting is closed'
    : errored
      ? "Couldn't update — try again"
      : `${count} ${value}s`;

  // Filled chips on the card surface. Your like lights coral; your dislike
  // answers in neutral bright — a downvote is a vote, not an accent action.
  // Both fill their icon so "yours" is readable at a glance.
  const stateClasses = errored
    ? 'bg-error/10 text-error ring-1 ring-inset ring-error/40'
    : active
      ? value === 'like'
        ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/40'
        : 'bg-text-primary/10 text-text-primary ring-1 ring-inset ring-text-muted/40'
      : 'bg-surface-2/60 text-text-muted hover:bg-surface-2 hover:text-text-primary';

  return (
    <motion.button
      type="button"
      onClick={() => onClick(value)}
      disabled={locked}
      aria-pressed={active}
      aria-label={`${value} (${count})`}
      title={title}
      initial={false}
      animate={active && !reduceMotion ? { scale: [1, 1.18, 1] } : { scale: 1 }}
      whileTap={reduceMotion || locked ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`flex items-center gap-1.5 rounded-btn px-2.5 py-1.5 transition-colors duration-200 ${stateClasses} ${
        locked ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <Icon className="h-4 w-4" fill={active ? 'currentColor' : 'none'} />
      {/* The tally is the board's liveliest number — a vote landing from
          another client should read as a change, not a silent text swap. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={count}
          initial={reduceMotion ? false : { y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? false : { y: -6, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="inline-block font-mono text-xs"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

const VoteButtons = ({ option }) => {
  const dispatch = useDispatch();
  const decided = useSelector((state) => state.board.board?.status === 'decided');
  const [errorValue, setErrorValue] = useState(null);

  // The pending guard used to *swallow* clicks made while a request was in
  // flight — on a slow connection that reads as a dead button. Now a click
  // during flight queues as the latest intent (one deep: rapid taps collapse
  // to the last thing the user meant) and fires the moment the in-flight
  // request settles. The queued execution must read state fresher than any
  // render closure (re-renders may not have flushed yet), so it asks the
  // store directly.
  const store = useStore();
  const pendingRef = useRef(false);
  const queuedValueRef = useRef(null);

  useEffect(() => {
    if (!errorValue) return undefined;
    const timer = window.setTimeout(() => setErrorValue(null), 2500);
    return () => window.clearTimeout(timer);
  }, [errorValue]);

  const execute = async (value) => {
    pendingRef.current = true;
    setErrorValue(null);

    const current =
      store.getState().board.options.find((o) => o.id === option.id) ?? option;
    const nextValue = current.vote === value ? null : value;
    const snapshot = {
      likesCount: current.likesCount,
      dislikesCount: current.dislikesCount,
      score: current.score,
      vote: current.vote,
    };

    dispatch(
      applyVoteUpdate({
        optionId: current.id,
        vote: nextValue,
        ...nextCounts(current, nextValue),
      }),
    );

    try {
      const result = nextValue
        ? await castVote(current.id, nextValue)
        : await removeVote(current.id);

      dispatch(
        applyVoteUpdate({
          optionId: current.id,
          likesCount: result.option.likesCount,
          dislikesCount: result.option.dislikesCount,
          score: result.option.score,
          vote: result.vote?.value ?? null,
        }),
      );
    } catch {
      dispatch(applyVoteUpdate({ optionId: current.id, ...snapshot }));
      setErrorValue(value);
    } finally {
      pendingRef.current = false;
      const queued = queuedValueRef.current;
      queuedValueRef.current = null;
      if (queued !== null) execute(queued);
    }
  };

  const handleClick = (value) => {
    if (decided) return;
    if (pendingRef.current) {
      queuedValueRef.current = value;
      return;
    }
    execute(value);
  };

  return (
    <div className="flex items-center gap-2">
      <VoteButton
        value="like"
        count={option.likesCount}
        active={option.vote === 'like'}
        errored={errorValue === 'like'}
        locked={decided}
        onClick={handleClick}
      />
      <VoteButton
        value="dislike"
        count={option.dislikesCount}
        active={option.vote === 'dislike'}
        errored={errorValue === 'dislike'}
        locked={decided}
        onClick={handleClick}
      />
    </div>
  );
};

export default VoteButtons;