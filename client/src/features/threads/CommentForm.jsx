import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Lock, Send } from 'lucide-react';
import { postComment } from '../../services/comments';
import { addComment } from '../../store/boardSlice';

const CommentForm = ({ optionId }) => {
  const dispatch = useDispatch();
  const decided = useSelector((state) => state.board.board?.status === 'decided');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await postComment(optionId, trimmed);
      dispatch(
        addComment({
          optionId,
          comment: result.comment,
          commentCount: result.option.commentCount,
        }),
      );
      setBody('');
    } catch (err) {
      setError(err.message || 'Could not post the comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={body}
          maxLength={2000}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add to the discussion..."
          className="min-w-0 flex-1 rounded-btn border border-border bg-surface px-3.5 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none transition-colors duration-200"
        />
        <button
          type="submit"
          aria-label="Post comment"
          disabled={!body.trim() || submitting}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-btn border transition-colors duration-200 ${
            body.trim() && !submitting
              ? 'border-accent bg-accent text-background hover:brightness-110'
              : 'cursor-not-allowed border-border bg-surface-2 text-text-muted/60'
          }`}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {error && (
        <p className="mt-1.5 font-sans text-xs text-error">{error}</p>
      )}
    </div>
  );
};

export default CommentForm;