import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { CornerDownRight, Loader2 } from 'lucide-react';
import { fetchReplies } from '../../services/comments';
import { appendReplies, setReplies } from '../../store/boardSlice';
import { Avatar, RoleBadge, YouChip } from '../../components/Identity';
import relativeTime from '../../utils/relativeTime';

/**
 * The replies under one comment, oldest first.
 *
 * Loaded on first expand and then left alone: the store is the record, so
 * collapsing (or collapsing the whole thread, or switching tabs) costs nothing
 * and re-opening never refetches. Live replies land here through the same
 * `comment:added` reducer the roots use.
 */
const CommentReplies = ({ optionId, commentId, nameFor, roleFor }) => {
  const dispatch = useDispatch();
  const page = useSelector((state) => state.board.comments[optionId]?.replies[commentId]);
  const sessionId = useSelector((state) => state.session?.id);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const reduceMotion = useReducedMotion();

  const status = page?.status ?? 'idle';

  const load = useCallback(() => {
    dispatch(setReplies({ optionId, commentId, items: [], hasMore: false, status: 'loading' }));
    fetchReplies(commentId)
      .then((data) =>
        dispatch(
          setReplies({
            optionId,
            commentId,
            items: data.replies,
            hasMore: Boolean(data.nextCursor),
            nextCursor: data.nextCursor ?? null,
          }),
        ),
      )
      .catch(() =>
        dispatch(setReplies({ optionId, commentId, items: [], hasMore: false, status: 'failed' })),
      );
  }, [dispatch, optionId, commentId]);

  useEffect(() => {
    if (status !== 'idle') return;
    load();
  }, [status, load]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setMoreError(false);
    try {
      const data = await fetchReplies(commentId, { cursor: page.nextCursor });
      dispatch(
        appendReplies({
          optionId,
          commentId,
          items: data.replies,
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

  if (status === 'loading' || status === 'idle') {
    return (
      <p className="flex items-center gap-2 py-2.5 font-sans text-xs text-text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading replies...
      </p>
    );
  }

  if (status === 'failed') {
    return (
      <p className="py-2.5 font-sans text-xs text-error">
        Couldn&apos;t load replies.{' '}
        <button
          type="button"
          onClick={load}
          className="text-accent underline underline-offset-2 hover:brightness-110"
        >
          Try again
        </button>
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-3 py-1">
        {page.items.map((reply, index) => {
          const name = nameFor(reply.participantId, reply.participantName);
          const role = roleFor(reply.participantId);

          return (
            <motion.li
              key={reply.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.22,
                // A long backfill page shouldn't crawl in one row at a time.
                delay: Math.min(index * 0.03, 0.24),
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex gap-2.5"
            >
              <Avatar name={name} role={role} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="font-sans text-[13px] font-semibold text-text-primary">
                    {name}
                  </span>
                  <RoleBadge role={role} />
                  {reply.participantId === sessionId && <YouChip />}
                  <time className="ml-auto shrink-0 font-sans text-[11px] text-text-muted/60">
                    {relativeTime(reply.createdAt)}
                  </time>
                </div>
                <p className="mt-0.5 whitespace-pre-line font-sans text-[13px] leading-relaxed text-text-primary/80">
                  {reply.body}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {page.hasMore && (
        <div className="relative my-1 flex justify-center">
          <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="relative flex items-center gap-1.5 rounded-btn bg-surface px-2 py-1 font-sans text-[11px] text-text-muted transition-colors duration-200 hover:text-text-primary disabled:opacity-60"
          >
            {loadingMore ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CornerDownRight className="h-3 w-3" />
            )}
            {loadingMore ? 'Loading…' : 'Load earlier replies'}
          </button>
          {moreError && (
            <p className="mt-2 font-sans text-[11px] text-error">Couldn&apos;t load more.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentReplies;