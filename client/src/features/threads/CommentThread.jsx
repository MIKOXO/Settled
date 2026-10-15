import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, MessageCircleMore } from 'lucide-react';
import { fetchComments } from '../../services/comments';
import { appendComments, setComments } from '../../store/boardSlice';
import { Avatar } from '../../components/Identity';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const MAX_FACES = 4;

// A stable empty array: `thread?.items ?? []` would hand `useMemo` a fresh
// array on every render and defeat the memo below.
const NO_COMMENTS = [];

const CommentThread = ({ option, open }) => {
  const dispatch = useDispatch();
  const thread = useSelector((state) => state.board.comments[option.id]);
  const roster = useSelector((state) => state.board.participants);
  const loadedRef = useRef(false);
  const [replyToId, setReplyToId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const reduceMotion = useReducedMotion();

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

  const status = thread?.status ?? 'idle';
  const items = thread?.items ?? NO_COMMENTS;
  const replies = thread?.replies;
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

  // Identity is resolved from the roster the board already holds: a comment
  // carries a display name but no role, and the People tab's live list has both.
  // A participant removed since still has their name on the comment.
  const nameFor = useCallback(
    (participantId, fallback) =>
      roster.find((p) => p.id === participantId)?.displayName ?? fallback ?? 'Someone',
    [roster],
  );

  const roleFor = useCallback(
    (participantId) => roster.find((p) => p.id === participantId)?.role ?? null,
    [roster],
  );

  // Who has spoken in this thread, for the header stack. Built from what's been
  // read so far (roots plus any replies already open) — it is a "who's here"
  // glance, not a directory.
  const faces = useMemo(() => {
    const ids = [];
    for (const comment of items) {
      ids.push(comment.participantId);
      for (const reply of replies?.[comment.id]?.items ?? []) ids.push(reply.participantId);
    }
    return [...new Set(ids)].slice(0, MAX_FACES);
  }, [items, replies]);

  const startReply = (id) => setReplyToId((current) => (current === id ? null : id));

  // The thread stays mounted while closed (fetch-once state and the store
  // copy both survive a collapse) — it is the container that folds away.
  return (
    <motion.div
      initial={false}
      animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
      transition={reduceMotion
        ? { duration: 0 }
        : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-4">
        {/* Same rule the Create form uses between its sections. */}
        <div className="mb-4 h-px bg-border" />

        {/* Header: who has spoken, what it's called, and how big it is — the three
            things a reader checks before reading anything. */}
        <div className="flex items-center gap-2.5 pb-3">
          <div className="flex shrink-0 -space-x-2">
            {faces.length > 0 ? (
              faces.map((id) => (
                <Avatar
                  key={id}
                  name={nameFor(id)}
                  role={roleFor(id)}
                  size="xs"
                  className="ring-2 ring-surface"
                />
              ))
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-text-muted ring-2 ring-surface">
                <MessageCircleMore className="h-3 w-3" />
              </span>
            )}
          </div>

          <h4 className="min-w-0 truncate font-sans text-sm font-medium text-text-primary">
            Discussion
          </h4>

          {option.commentCount > 0 && (
            <span className="ml-auto shrink-0 font-mono text-[11px] text-text-muted">
              {option.commentCount} {option.commentCount === 1 ? 'message' : 'messages'}
            </span>
          )}
        </div>

        <div className="h-px bg-border" />

        <div className="mt-3.5">
          <CommentForm optionId={option.id} />
        </div>

        {status === 'loading' && (
          <div className="mt-5 flex items-center gap-2 font-sans text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading comments...
          </div>
        )}

        {status === 'failed' && (
          <p className="mt-5 font-sans text-sm text-error">Couldn&apos;t load comments.</p>
        )}

        {(status === 'succeeded' || status === 'idle') && items.length === 0 && (
          <p className="mt-4 rounded-btn border border-dashed border-border px-3 py-6 text-center font-sans text-sm text-text-muted">
            No comments yet — start the discussion.
          </p>
        )}

        {items.length > 0 && (
          <ul className="mt-2">
            {items.map((comment) => (
              <CommentItem
                key={comment.id}
                optionId={option.id}
                comment={comment}
                nameFor={nameFor}
                roleFor={roleFor}
                replying={replyToId === comment.id}
                onReply={() => startReply(comment.id)}
                onCancelReply={() => setReplyToId(null)}
              />
            ))}
          </ul>
        )}

        {items.length > 0 && hasMore && (
          // A rule with the action centred in it: a boundary between what you've
          // read and what hasn't, not another box in the stack.
          <div className="relative mt-2 flex justify-center">
            <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="relative flex items-center gap-1.5 rounded-btn bg-surface px-2.5 py-1 font-sans text-xs text-text-muted transition-colors duration-200 hover:text-text-primary disabled:opacity-60"
            >
              {loadingMore && <Loader2 className="h-3 w-3 animate-spin" />}
              {loadingMore ? 'Loading…' : 'Load older comments'}
            </button>
            {moreError && (
              <p className="mt-2 font-sans text-xs text-error">Couldn&apos;t load more.</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentThread;