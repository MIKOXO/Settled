import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, ExternalLink, MapPin, MessageSquare } from 'lucide-react';
import VoteButtons from '../voting/VoteButtons';
import CommentThread from '../threads/CommentThread';
import EditOptionForm from './EditOptionForm';
import OptionActions from './OptionActions';
import { deleteOption } from '../../services/options';
import { removeOption } from '../../store/boardSlice';

const LeadingTag = () => (
  <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-secondary/15 px-2 py-0.5 font-sans text-[11px] font-semibold text-accent-secondary">
    Leading
  </span>
);

const OptionCard = ({ option, onViewOnMap, glowUniqueId }) => {
  const {
    title,
    notes,
    link,
    photoUrl,
    isLeading,
    commentCount,
    location,
  } = option;
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const [threadOpen, setThreadOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const reduceMotion = useReducedMotion();

  // Mirrors the server's rule (utils/optionGuard.js): the owner can change
  // anyone's option, and so can the person who proposed it. Everyone else sees
  // the card read-only — the controls are hidden rather than shown-and-failing,
  // but the server still decides.
  const canManage = session?.role === 'owner' || session?.id === option.createdBy;

  const handleDelete = () => deleteOption(option.id).then(() => dispatch(removeOption(option.id)));

  return (
    <motion.article
      layout={reduceMotion ? false : 'position'}
      transition={reduceMotion
        ? undefined
        : { type: 'spring', stiffness: 500, damping: 40 }}
      className={`relative rounded-card border bg-surface p-4 transition-colors duration-200 ${
        isLeading ? 'border-accent-secondary/50' : 'border-border'
      }`}
    >
      {isLeading && (
        <motion.span
          layoutId={glowUniqueId ? 'leadingOptionGlow' : undefined}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 -top-px h-px bg-accent-secondary"
          transition={reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      {editing ? (
        <EditOptionForm option={option} onDone={() => setEditing(false)} />
      ) : (
        <>
          {/* Title row: primary identity, with the Leading tag kept out of the
              action row. */}
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 font-heading text-base font-semibold leading-snug text-text-primary">
              {title}
            </h3>
            {isLeading && <LeadingTag />}
          </div>

          {/* Secondary block: photo thumbnail, notes, link — muted on purpose. */}
          {(photoUrl || notes || link) && (
            <div className="mt-3">
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt=""
                  className="mb-3 h-40 w-full rounded-btn border border-border object-cover sm:h-48"
                />
              )}

              {notes && (
                <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-text-muted">
                  {notes}
                </p>
              )}

              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex max-w-full items-center gap-1.5 font-sans text-sm text-accent underline-offset-2 hover:underline ${
                    notes ? 'mt-2' : ''
                  }`}
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              )}
            </div>
          )}

          {/* Single action row: vote, discuss, locate, and — for the option's
              creator and the owner — an overflow menu holding edit and delete.
              Wraps because the delete confirm is wider than the ⋯ trigger it
              replaces, and a narrow phone shouldn't push it off the row. */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <VoteButtons option={option} />

            <button
              type="button"
              onClick={() => setThreadOpen((wasOpen) => !wasOpen)}
              aria-expanded={threadOpen}
              className="flex items-center gap-1.5 rounded-btn px-2 py-1.5 font-sans text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="font-mono text-xs">{commentCount}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  threadOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {location && (
              <button
                type="button"
                onClick={onViewOnMap}
                title="View on map"
                aria-label="View on map"
                className="flex items-center gap-1.5 rounded-btn px-2 py-1.5 font-sans text-xs text-text-muted transition-colors duration-200 hover:text-accent"
              >
                <MapPin className="h-4 w-4" />
              </button>
            )}

            {canManage && (
              <div className="ml-auto flex items-center">
                <OptionActions
                  onEdit={() => setEditing(true)}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </div>

          <CommentThread option={option} open={threadOpen} />
        </>
      )}
    </motion.article>
  );
};

const OptionsList = ({ onViewOnMap }) => {
  const options = useSelector((state) => state.board.options);

  // Live ranking: cards glide up/down as scores change. The server's order
  // (createdAt desc) stays authoritative in the store — this is a derived
  // view-order only, so nothing about the store shape or socket flow moves.
  // Ties keep their relative order via the stable sort.
  const ranked = useMemo(
    () => [...options].sort((a, b) => b.score - a.score),
    [options],
  );

  // Ties can flag several options leading at once — the traveling layoutId
  // glow is only mounted when exactly one option leads, so it never has
  // duplicates fighting over the same id.
  const glowUniqueId = options.filter((o) => o.isLeading).length === 1;

  if (options.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface px-6 py-14 text-center">
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
    <section aria-label="Options">
      <div className="space-y-3">
        {ranked.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            onViewOnMap={onViewOnMap}
            glowUniqueId={glowUniqueId}
          />
        ))}
      </div>
    </section>
  );
};

export default OptionsList;
