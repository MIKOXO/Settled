import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, Circle, MessageSquare, Trophy, ExternalLink } from 'lucide-react';
import VoteButtons from '../voting/VoteButtons';
import CommentThread from '../threads/CommentThread';

const OptionCard = ({ option }) => {
  const {
    title,
    notes,
    link,
    photoUrl,
    score,
    isLeading,
    commentCount,
  } = option;
  const [threadOpen, setThreadOpen] = useState(false);

  return (
    <article
      className={`rounded-card border bg-surface p-4 transition-colors duration-200 ${
        isLeading ? 'border-accent-secondary/50' : 'border-border'
      }`}
    >
      <div className="flex gap-4">
        {photoUrl && (
          <div className="shrink-0">
            <img
              src={photoUrl}
              alt=""
              className="h-20 w-20 rounded-btn border border-border object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold text-text-primary">
            {title}
          </h3>

          {notes && (
            <p className="mt-1 whitespace-pre-line font-sans text-sm text-text-muted">
              {notes}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-sans text-sm text-accent underline-offset-2 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="max-w-52 truncate">{link}</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setThreadOpen((wasOpen) => !wasOpen)}
              aria-expanded={threadOpen}
              className="flex items-center gap-1.5 font-sans text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  threadOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <VoteButtons option={option} />

            <span
              className={`flex items-center gap-1.5 font-mono text-sm font-medium ${
                score > 0 ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              <Circle className="h-3.5 w-3.5" />
              {score}
            </span>

            {isLeading && (
              <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-accent-secondary">
                <Trophy className="h-3.5 w-3.5" />
                Leading
              </span>
            )}
          </div>
        </div>
      </div>

      <CommentThread option={option} open={threadOpen} />
    </article>
  );
};

const OptionsList = () => {
  const options = useSelector((state) => state.board.options);

  if (options.length === 0) {
    return (
      <div className="mt-8 rounded-card border border-dashed border-border bg-surface px-6 py-14 text-center">
        <p className="font-heading text-lg font-semibold text-text-primary">
          No options yet
        </p>
        <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-text-muted">
          Be the first to propose one and get the discussion started.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Options
        </h2>
        <span className="font-mono text-sm text-text-muted">
          {options.length}
        </span>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard key={option.id} option={option} />
        ))}
      </div>
    </section>
  );
};

export default OptionsList;