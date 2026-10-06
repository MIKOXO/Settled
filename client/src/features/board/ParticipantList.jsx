import { useSelector, useDispatch } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, UsersRound, X } from 'lucide-react';
import { removeParticipant } from '../../services/board';
import { setParticipants } from '../../store/boardSlice';
import ConfirmButton from '../../components/ConfirmButton';
import initialsOf from '../../utils/initials';

const RoleBadge = ({ role }) =>
  role === 'owner' ? (
    <span className="shrink-0 rounded-btn bg-accent-secondary/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-accent-secondary">
      Owner
    </span>
  ) : (
    <span className="shrink-0 rounded-btn bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-text-muted">
      Member
    </span>
  );

/**
 * The People tab's content. Everyone on the board can see this list — only the
 * remove control is owner-only, gated here rather than by hiding the panel, so a
 * member sees the same roster with no management affordances.
 *
 * "Shared a location" is read straight from the store (`participantLocations`,
 * kept live by Module 8's socket events) — no fetch of its own.
 */
const ParticipantList = ({ boardId, onViewOnMap }) => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const participants = useSelector((state) => state.board.participants);
  const participantLocations = useSelector((state) => state.board.participantLocations);
  const reduceMotion = useReducedMotion();

  const isOwner = session?.role === 'owner';
  const sharedIds = new Set(participantLocations.map((loc) => loc.participantId));

  const handleRemove = async (participantId) => {
    await removeParticipant(boardId, participantId);
    dispatch(setParticipants(participants.filter((p) => p.id !== participantId)));
  };

  if (participants.length === 0) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl rounded-card border border-dashed border-border bg-surface px-6 py-14 text-center"
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
          <UsersRound className="h-5 w-5" />
        </div>
        <p className="mt-4 font-heading text-lg font-semibold text-text-primary">Nobody here yet</p>
        <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-text-muted">
          Share the invite link to get the first person on this board.
        </p>
      </motion.div>
    );
  }

  return (
    <section aria-label="People" className="max-w-3xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-sans text-sm text-text-muted">Everyone on this board</p>
        <span className="font-mono text-xs text-text-muted">
          {sharedIds.size} sharing location{sharedIds.size === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="rounded-card border border-border bg-surface p-2">
        {participants.map((p, index) => {
          const isMe = p.id === session?.id;
          const hasLocation = sharedIds.has(p.id);

          const identity = (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-sans text-sm font-medium text-text-primary">
                  {p.displayName}
                </p>
                <RoleBadge role={p.role} />
                {isMe && (
                  <span className="shrink-0 rounded-btn bg-accent/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-accent">
                    You
                  </span>
                )}
              </div>

              <p
                className={`mt-0.5 flex items-center gap-1 font-sans text-xs ${
                  hasLocation ? 'text-accent-secondary' : 'text-text-muted'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {hasLocation ? 'Location shared — view on map' : 'No location shared'}
              </p>
            </>
          );

          return (
            <motion.li
              key={p.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: Math.min(index * 0.04, 0.32),
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center gap-3 rounded-btn px-2 py-2 transition-colors duration-150 hover:bg-surface-2/60"
            >
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                  p.role === 'owner'
                    ? 'bg-accent-secondary/15 text-accent-secondary ring-1 ring-accent-secondary/40'
                    : 'bg-surface-2 text-text-muted'
                }`}
              >
                {initialsOf(p.displayName)}
              </span>

              {/* The whole identity block is the tap target when there's a pin
                  to look at; without one it stays inert so the row reads as
                  plain text rather than a dead control. */}
              {hasLocation && onViewOnMap ? (
                <button
                  type="button"
                  onClick={() => onViewOnMap(p.id)}
                  title={`View ${p.displayName} on the map`}
                  className="min-w-0 flex-1 text-left"
                >
                  {identity}
                </button>
              ) : (
                <div className="min-w-0 flex-1">{identity}</div>
              )}

              {isOwner && !isMe && (
                <ConfirmButton
                  onConfirm={() => handleRemove(p.id)}
                  question="Remove?"
                  icon={<X className="h-4 w-4" />}
                  triggerLabel={`Remove ${p.displayName}`}
                />
              )}
            </motion.li>
          );
        })}
      </ul>

      <p className="mt-3 font-sans text-xs text-text-muted">
        Anyone can share their exact location from the Map tab — it stays private until they
        opt in.
      </p>
    </section>
  );
};

export default ParticipantList;
