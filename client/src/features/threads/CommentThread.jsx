import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { fetchComments } from '../../services/comments';
import { appendComments, setComments } from '../../store/boardSlice';
import CommentForm from './CommentForm';

const TIME_STEPS = [
  { unit: 'year', ms: 365 * 24 * 3600 * 1000 },
  { unit: 'month', ms: 30 * 24 * 3600 * 1000 },
  { unit: 'week', ms: 7 * 24 * 3600 * 1000 },
  { unit: 'day', ms: 24 * 3600 * 1000 },
  { unit: 'hour', ms: 3600 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const relativeTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60 * 1000) return 'just now';
  const step = TIME_STEPS.find((s) => diff >= s.ms);
  if (!step) return '';
  return relativeTimeFormatter.format(-Math.round(diff / step.ms), step.unit);
};

const CommentThread = ({ option, open }) => {
  const dispatch = useDispatch();
  const thread = useSelector((state) => state.board.comments[option.id]);
  const loadedRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);

  useEffect(() => {
    if (!open || loadedRef.current) return undefined;
    loadedRef.current = true;

    dispatch(
      setComments({ optionId: option.id, items: [], hasMore: false, status: 'loading' }),
    );
    fetchComments(option.id)
      .then((data) =>
        dispatch(
          setComments({
            optionId: option.id,
            items: data.comments,
            hasMore: Boolean(data.nextCursor),
            nextCursor: data.nextCursor ?? null,
          }),
        ),
      )
      .catch(() =>
        dispatch(
          setComments({ optionId: option.id, items: [], hasMore: false, status: 'failed' }),
        ),
      );

    return undefined;
  }, [open, option.id, dispatch]);

  if (!open) return null;

  const status = thread?.status ?? 'idle';
  const items = thread?.items ?? [];
  const hasMore = thread?.hasMore ?? false;
  const nextCursor = thread?.nextCursor ?? null;

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setMoreError(false);
    try {
      const data = await fetchComments(option.id, { cursor: nextCursor });
      dispatch(
        appendComments({
          optionId: option.id,
          items: data.comments,
          hasMore: Boolean(data.nextCursor),
          nextCursor: data.nextCursor ?? null,
        }),
      );
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <CommentForm optionId={option.id} />

      {status === 'loading' && (
        <div className="mt-3 flex items-center gap-2 font-sans text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading comments...
        </div>
      )}

      {status === 'failed' && (
        <p className="mt-3 font-sans text-sm text-error">
          Couldn&apos;t load comments.
        </p>
      )}

      {(status === 'succeeded' || status === 'idle') && items.length === 0 && (
        <p className="mt-3 font-sans text-sm text-text-muted">
          No comments yet — start the discussion.
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-3 space-y-3">
          {items.map((comment) => (
            <li key={comment.id} className="rounded-btn border border-border bg-surface-2/60 px-3.5 py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-sm font-medium text-text-primary">
                  {comment.participantName ?? 'Someone'}
                </span>
                <time className="font-sans text-xs text-text-muted">
                  {relativeTime(comment.createdAt)}
                </time>
              </div>
              <p className="mt-0.5 whitespace-pre-line font-sans text-sm text-text-muted">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && hasMore && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-btn border border-border px-3 py-1.5 font-sans text-sm text-text-muted transition-colors duration-200 hover:border-accent hover:text-text-primary disabled:opacity-60"
          >
            {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loadingMore ? 'Loading...' : 'Load older comments'}
          </button>
          {moreError && (
            <p className="mt-2 font-sans text-xs text-error">
              Couldn&apos;t load more comments.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentThread;