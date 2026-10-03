import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownWideNarrow, ChevronDown, ExternalLink, Lightbulb, MapPin, MessageSquare } from 'lucide-react';
import VoteButtons from '../voting/VoteButtons';
import CommentThread from '../threads/CommentThread';
import EditOptionForm from './EditOptionForm';
import OptionActions from './OptionActions';
import { deleteOption } from '../../services/options';
import { removeOption } from '../../store/boardSlice';

const LeadingTag = () => (
  <motion.span
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.7 }}
    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    className="flex shrink-0 items-center gap-1 rounded-full bg-accent-secondary/15 px-2 py-0.5 font-sans text-[11px] font-semibold text-accent-secondary"
  >
    Leading
  </motion.span>
);

// Score is what ranks the list, but the raw like/dislike buttons don't show
// it — without the net number a card's position reads as arbitrary, and a
// live re-rank looks like the list shuffling itself for no reason.
const ScoreChip = ({ score }) => {
  const reduceMotion = useReducedMotion();
  const label = score > 0 ? `+${score}` : score < 0 ? `−${Math.abs(score)}` : '0';

  return (
    <span
      title="Score = likes − dislikes"
      aria-label={`Score ${score}`}
      className={`flex items-center rounded-btn bg-surface-2 px-2 py-1.5 font-mono text-xs font-medium ${
        score === 0 ? 'text-text-muted' : 'text-text-primary'
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          initial={reduceMotion ? false : { y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? false : { y: -6, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="inline-block"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const OptionCard = ({ option, onViewOnMap, glowUniqueId, enterDelay = 0 }) => {
  const {
    title,
    notes,
    link,
    photoUrl,
    isLeading,
    commentCount,
    location,
    score,
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
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion
        ? { type: 'spring', stiffness: 500, damping: 40 }
        : {
            // Entrance values carry the stagger delay; the layout re-rank
            // spring must not, or a live vote would reorder with a lag.
            opacity: { duration: 0.2, delay: enterDelay },
            y: { duration: 0.35, delay: enterDelay, ease: [0.22, 1, 0.36, 1] },
            default: { type: 'spring', stiffness: 500, damping: 40 },
          }}
      className={`relative rounded-card border bg-surface p-4 transition-colors duration-200 ${
        isLeading
          ? 'border-accent-secondary/50 hover:border-accent-secondary/80'
          : 'border-border hover:border-text-muted/30'
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
            <AnimatePresence initial={false} mode="popLayout">
              {isLeading && <LeadingTag key="leading" />}
            </AnimatePresence>
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
            <ScoreChip score={score} />
            <VoteButtons option={option} />

            <button
              type="button"
              onClick={() => setThreadOpen((wasOpen) => !wasOpen)}
              aria-expanded={threadOpen}
              className="flex items-center gap-1.5 rounded-btn px-2 py-1.5 font-sans text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
            >
              <MessageSquare className="h-4 w-4" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={commentCount}
                  initial={reduceMotion ? false : { y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduceMotion ? false : { y: -6, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="inline-block font-mono text-xs"
                >
                  {commentCount}
                </motion.span>
              </AnimatePresence>
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
  const reduceMotion = useReducedMotion();

  // The stagger belongs to the options present at mount. A card added later
  // (locally or via socket) still rises in, but with no queue position — its
  // delay must be zero or a busy board would watch late options crawl.
  const [mountIds] = useState(() => new Set(options.map((o) => o.id)));

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
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-card border border-dashed border-border bg-surface px-6 py-14 text-center"
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Lightbulb className="h-5 w-5" />
        </div>
        <p className="mt-4 font-heading text-lg font-semibold text-text-primary">
          No options yet
        </p>
        <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-text-muted">
          Be the first to propose one and get the discussion started.
        </p>
      </motion.div>
    );
  }

  return (
    <section aria-label="Options">
      <p className="mb-3 flex items-center gap-1.5 font-sans text-xs text-text-muted">
        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
        Ranked live by score
      </p>
      <div className="space-y-3">
        {ranked.map((option, index) => (
          <OptionCard
            key={option.id}
            option={option}
            onViewOnMap={onViewOnMap}
            glowUniqueId={glowUniqueId}
            enterDelay={mountIds.has(option.id) ? Math.min(index * 0.05, 0.4) : 0}
          />
        ))}
      </div>
    </section>
  );
};

export default OptionsList;
