import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownWideNarrow, ChevronDown, ExternalLink, Lightbulb, MapPin, MessageSquare, Trophy } from 'lucide-react';
import VoteButtons from '../voting/VoteButtons';
import CommentThread from '../threads/CommentThread';
import EditOptionForm from './EditOptionForm';
import OptionActions from './OptionActions';
import { deleteOption } from '../../services/options';
import { removeOption } from '../../store/boardSlice';
import initialsOf from '../../utils/initials';

const LeadingTag = () => (
  <motion.span
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.7 }}
    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    className="flex shrink-0 items-center gap-1 rounded-full bg-accent-secondary/15 px-2 py-0.5 font-sans text-[11px] font-semibold text-accent-secondary"
  >
    <Trophy className="h-3 w-3" />
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

// Who proposed it, as a tag rather than a line of text: initials avatar in
// the brand coral + the display name, quiet enough to sit next to the title
// without competing with the Leading tag.
const ProposerTag = ({ name }) => (
  <span
    title={`Proposed by ${name}`}
    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pl-0.5 pr-2 font-sans text-[11px] font-medium text-text-muted"
  >
    <span
      aria-hidden="true"
      className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 font-mono text-[8px] font-semibold text-accent"
    >
      {initialsOf(name)}
    </span>
    {name}
  </span>
);

const OptionCard = ({ option, onViewOnMap, isTopLiked, enterDelay = 0 }) => {
  const {
    title,
    notes,
    link,
    photoUrl,
    commentCount,
    location,
    score,
  } = option;
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const proposer = useSelector((state) =>
    state.board.participants.find((p) => p.id === option.createdBy),
  );
  const [threadOpen, setThreadOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const reduceMotion = useReducedMotion();

  // The proposer may have left the board since (options outlive membership)
  // — fall back gracefully, and name yourself as yourself.
  const proposerName =
    option.createdBy === session?.id ? 'You' : (proposer?.displayName ?? 'Someone');

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
      className={`relative rounded-card border p-4 transition-[border-color,box-shadow] duration-300 ${
        isTopLiked
          ? 'animate-leading-halo border-accent-secondary/60 bg-gradient-to-b from-accent-secondary/[0.07] to-surface shadow-[0_0_36px_-10px_rgb(var(--accent-secondary-rgb)_/_0.3)] hover:border-accent-secondary'
          : 'bg-surface hover:border-text-muted/30 border-border'
      }`}
    >
      {isTopLiked && (
        // The beam: a tight gradient line plus a blurred bloom copy, a bright
        // shimmer streak sweeping its length, and a breathing base opacity —
        // it travels between leaders via layoutId. The halo pulses separately
        // (CSS keyframes on the card). Together the leader should feel live,
        // not just highlighted.
        <motion.span
          layoutId="leadingOptionGlow"
          aria-hidden="true"
          animate={reduceMotion ? undefined : { opacity: [0.55, 1] }}
          transition={reduceMotion
            ? { duration: 0 }
            : {
                default: { type: 'spring', stiffness: 350, damping: 30 },
                opacity: { duration: 1.4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              }}
          className="pointer-events-none absolute inset-x-4 -top-px h-px"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-secondary to-transparent" />
          <span className="absolute inset-x-0 -top-0.5 h-1 bg-accent-secondary/40 blur-[4px]" />
          {!reduceMotion && (
            // The streak clips to the beam's own length — without the mask it
            // sweeps right off the card and across the page background.
            <span className="absolute inset-x-0 top-0 h-px overflow-hidden">
              <motion.span
                animate={{ x: ['-100%', '500%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
                className="absolute inset-y-0 w-1/5 bg-gradient-to-r from-transparent via-text-primary/90 to-transparent"
              />
            </span>
          )}
        </motion.span>
      )}

      {editing ? (
        <EditOptionForm option={option} onDone={() => setEditing(false)} />
      ) : (
        <>
          {/* Title row: primary identity + who proposed it, with the Leading
              tag pinned to the far right, out of the wrap flow. */}
          <div className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3.5 gap-y-1.5">
              <h3 className="min-w-0 font-heading text-base font-semibold leading-snug text-text-primary">
                {title}
              </h3>
              <ProposerTag name={proposerName} />
            </div>
            <AnimatePresence initial={false} mode="popLayout">
              {isTopLiked && <LeadingTag key="leading" />}
            </AnimatePresence>
          </div>

          {/* Secondary block: photo thumbnail, notes, link, place — muted on
              purpose. */}
          {(photoUrl || notes || link || location) && (
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

              {/* The place as a tappable chip, not a bare action-row icon:
                  it names the spot and flies the map to the pin. Falls back
                  to coordinates when the pin was dropped manually. */}
              {location && (
                <button
                  type="button"
                  onClick={() => onViewOnMap(option.id)}
                  title="View on the map"
                  className={`inline-flex max-w-full items-center gap-1.5 rounded-btn border border-border bg-surface-2/60 px-2 py-1 font-sans text-xs text-text-muted transition-colors duration-200 hover:border-accent/50 hover:text-accent ${
                    photoUrl || notes || link ? 'mt-2' : ''
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="truncate">
                    {location.placeName ?? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Single action row: score, vote, discuss, and — for the option's
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

  // One leader or none: the tag/border/glow belong to the single option
  // with the most likes. The server's isLeading flags every tied option,
  // which on a fresh board (all zeros) meant *every* card read "Leading" —
  // a highlight that marks everything marks nothing. Ties at the top and
  // all-zero boards show no leader.
  const topLikesId = useMemo(() => {
    if (options.length === 0) return null;
    const max = Math.max(...options.map((o) => o.likesCount));
    if (max === 0) return null;
    const top = options.filter((o) => o.likesCount === max);
    return top.length === 1 ? top[0].id : null;
  }, [options]);

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
            isTopLiked={option.id === topLikesId}
            enterDelay={mountIds.has(option.id) ? Math.min(index * 0.05, 0.4) : 0}
          />
        ))}
      </div>
    </section>
  );
};

export default OptionsList;
