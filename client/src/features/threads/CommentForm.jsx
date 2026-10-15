import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Lock, Send, X } from 'lucide-react';
import { postComment } from '../../services/comments';
import { addComment } from '../../store/boardSlice';
import { Avatar } from '../../components/Identity';

/**
 * One composer, two jobs: a new comment on the option, or a reply to a comment
 * in it. `replyTo` switches on reply mode — a compact "who" chip inside the
 * field, a different placeholder, and a `parentId` on the POST.
 *
 * The POST response IS the reconciled state, so there's no optimistic prepend
 * here (same reasoning as the pre-reply composer).
 */
const CommentForm = ({ optionId, replyTo = null, onCancelReply = null }) => {
  const dispatch = useDispatch();
  const decided = useSelector((state) => state.board.board?.status === 'decided');
  const session = useSelector((state) => state.session);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await postComment(optionId, trimmed, { parentId: replyTo?.id });
      dispatch(
        addComment({
          optionId,
          comment: result.comment,
          commentCount: result.option.commentCount,
          replyCount: result.replyCount,
        }),
      );
      setBody('');
      onCancelReply?.();
    } catch (err) {
      setError(err.message || 'Could not post the comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Reads stay open — the existing thread is history worth keeping — but the
  // decision is final, so there's nothing new to argue about. A message beats a
  // greyed-out input, which only invites a submit that 403s.
  if (decided) {
    return (
      <p className="flex items-center gap-2 font-sans text-xs text-text-muted/70">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        This board&apos;s decision is locked — no new comments.
      </p>
    );
  }

  const canSubmit = Boolean(body.trim()) && !submitting;

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2.5">
        {!replyTo && <Avatar name={session?.displayName} role={session?.role} size="md" />}

        {/* Same field as the Create form — `border-border` on a `bg-surface` fill,
            turning coral on focus — so a comment box and a form box read as one
            system. The outline has to live on the wrapper rather than the input
            because reply mode puts a chip and the send button inside it. */}
        <div
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-btn border border-border bg-surface pl-3 pr-1.5 transition-colors duration-200 focus-within:border-accent ${
            replyTo ? 'pl-1.5' : ''
          }`}
        >
          {replyTo && (
            <>
              {/* Who you're answering, kept inside the field so the composer
                  doesn't change height when reply mode opens. */}
              <span className="flex min-w-0 shrink items-center gap-1 rounded-btn bg-accent/10 py-1 pl-2 pr-1 text-[11px] font-medium text-accent">
                <span className="truncate">{replyTo.name}</span>
                <button
                  type="button"
                  onClick={onCancelReply}
                  aria-label="Cancel reply"
                  className="rounded-full p-0.5 transition-colors duration-200 hover:bg-accent/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
              <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
            </>
          )}

          <input
            type="text"
            value={body}
            maxLength={2000}
            onChange={(e) => setBody(e.target.value)}
            placeholder={replyTo ? 'Write a reply…' : 'Add to the discussion…'}
            aria-label={replyTo ? 'Post reply' : 'Post comment'}
            className="min-w-0 flex-1 bg-transparent py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none"
          />

          <button
            type="submit"
            aria-label={replyTo ? 'Post reply' : 'Post comment'}
            disabled={!canSubmit}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-btn transition-all duration-200 ${
              canSubmit
                ? 'bg-accent text-background shadow-[0_2px_14px_-4px_rgb(var(--accent-primary-rgb)_/_0.7)] hover:brightness-110 active:scale-95'
                : 'cursor-not-allowed bg-surface-2 text-text-muted/40'
            }`}
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {error && <p className="mt-1.5 pl-[2.625rem] font-sans text-xs text-error">{error}</p>}
    </form>
  );
};

export default CommentForm;