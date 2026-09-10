import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
  disabled,
  onClick,
}) => {
  const Icon = value === 'like' ? ThumbsUp : ThumbsDown;

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      disabled={disabled}
      aria-pressed={active}
      aria-label={`${value} (${count})`}
      title={
        errored ? "Couldn't update — try again" : `${count} ${value}s`
      }
      className={`flex items-center gap-1.5 rounded-btn border px-2.5 py-1.5 transition-colors duration-150 ${
        errored
          ? 'border-error/70 text-error'
          : active
            ? 'border-accent text-accent'
            : 'border-border text-text-muted hover:border-accent/50 hover:text-text-primary'
      } ${disabled ? 'cursor-wait opacity-60' : ''}`}
    >
      <Icon className="h-4 w-4" />
      <span className="font-mono text-xs">{count}</span>
    </button>
  );
};

const VoteButtons = ({ option }) => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [errorValue, setErrorValue] = useState(null);

  useEffect(() => {
    if (!errorValue) return undefined;
    const timer = window.setTimeout(() => setErrorValue(null), 2500);
    return () => window.clearTimeout(timer);
  }, [errorValue]);

  const handleClick = async (value) => {
    if (pending) return;

    const nextValue = option.vote === value ? null : value;
    const snapshot = {
      likesCount: option.likesCount,
      dislikesCount: option.dislikesCount,
      score: option.score,
      vote: option.vote,
    };

    dispatch(
      applyVoteUpdate({
        optionId: option.id,
        vote: nextValue,
        ...nextCounts(option, nextValue),
      }),
    );
    setPending(true);
    setErrorValue(null);

    try {
      const result = nextValue
        ? await castVote(option.id, nextValue)
        : await removeVote(option.id);

      dispatch(
        applyVoteUpdate({
          optionId: option.id,
          likesCount: result.option.likesCount,
          dislikesCount: result.option.dislikesCount,
          score: result.option.score,
          vote: result.vote?.value ?? null,
        }),
      );
    } catch {
      dispatch(applyVoteUpdate({ optionId: option.id, ...snapshot }));
      setErrorValue(value);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <VoteButton
        value="like"
        count={option.likesCount}
        active={option.vote === 'like'}
        errored={errorValue === 'like'}
        disabled={pending}
        onClick={handleClick}
      />
      <VoteButton
        value="dislike"
        count={option.dislikesCount}
        active={option.vote === 'dislike'}
        errored={errorValue === 'dislike'}
        disabled={pending}
        onClick={handleClick}
      />
    </div>
  );
};

export default VoteButtons;