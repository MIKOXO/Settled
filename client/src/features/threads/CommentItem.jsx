import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, MessageSquareReply } from 'lucide-react';
import { Avatar, RoleBadge, YouChip } from '../../components/Identity';
import relativeTime from '../../utils/relativeTime';
import CommentForm from './CommentForm';
import CommentReplies from './CommentReplies';

// Where the reply composer and the reply rail start: the parent avatar's width
// plus the gutter, so replies hang off the person being answered.
const INDENT = 'pl-7';

/**
 * One top-level comment: who said it, when, and the two things you can do with
 * it — answer it, or open the answers. Replies themselves never offer a reply
 * (depth is capped at two), so the affordance lives only here.
 *
 * `nameFor` / `roleFor` resolve a participant id against the live roster the
 * board already keeps in the store — no per-comment request, and a participant
 * removed since still resolves to their name rather than an empty row.
 */
const CommentItem = ({
  optionId,
  comment,
  nameFor,
  roleFor,
  replying,
  onReply,
  onCancelReply,
}) => {
  const sessionId = useSelector((state) => state.session?.id);
  const decided = useSelector((state) => state.board.board?.status === 'decided');
  const [repliesOpen, setRepliesOpen] = useState(false);

  const name = nameFor(comment.participantId, comment.participantName);
  const role = roleFor(comment.participantId);
  const replyCount = comment.replyCount ?? 0;
  const showReplies = repliesOpen || replying;

  // Ghost chips rather than bare text links: the target is a phone, and these
  // are the only way into the rest of the thread.
  const actionClass =
    'inline-flex items-center gap-1.5 rounded-btn px-2 py-1 font-sans text-xs transition-colors duration-200';

  return (
    <li className="group py-2">
      <div className="flex gap-3">
        <Avatar name={name} role={role} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-sans text-sm font-semibold text-text-primary">{name}</span>
            <RoleBadge role={role} />
            {comment.participantId === sessionId && <YouChip />}
            <time className="ml-auto shrink-0 font-sans text-[11px] text-text-muted/60">
              {relativeTime(comment.createdAt)}
            </time>
          </div>

          <p className="mt-1 whitespace-pre-line font-sans text-sm leading-relaxed text-text-primary/85">
            {comment.body}
          </p>

          {!decided && (
            <div className="-ml-2 mt-1.5 flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={onReply}
                aria-expanded={replying}
                className={`${actionClass} ${
                  replying
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-muted hover:bg-surface-2/70 hover:text-text-primary'
                }`}
              >
                <MessageSquareReply className="h-3.5 w-3.5" />
                Reply
              </button>

              {replyCount > 0 && (
                <button
                  type="button"
                  onClick={() => setRepliesOpen((wasOpen) => !wasOpen)}
                  aria-expanded={repliesOpen}
                  className={`${actionClass} text-text-muted hover:bg-surface-2/70 hover:text-text-primary`}
                >
                  <span className="font-mono">{replyCount}</span>
                  {replyCount === 1 ? 'reply' : 'replies'}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      repliesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {replying && (
        <div className={`${INDENT} mt-2`}>
          <CommentForm
            optionId={optionId}
            replyTo={{ id: comment.id, name }}
            onCancelReply={onCancelReply}
          />
        </div>
      )}

      {showReplies && (
        // The bracket — a rail descending from the parent avatar's centre, then
        // a rounded corner bending right into the first reply — is what makes a
        // nested list read as a conversation rather than a second, unrelated
        // list. It sits left of every reply avatar, so it never crosses one. Decorative, so it's aria-hidden.
        <div className={`relative mt-1.5 ${INDENT}`}>
          <span aria-hidden="true" className="absolute bottom-2 left-4 top-0 w-px bg-border" />
          <span
            aria-hidden="true"
            className="absolute left-4 top-0 h-3 w-3 rounded-bl-lg border-b border-l border-border"
          />
          <CommentReplies
            optionId={optionId}
            commentId={comment.id}
            nameFor={nameFor}
            roleFor={roleFor}
          />
        </div>
      )}
    </li>
  );
};

export default CommentItem;