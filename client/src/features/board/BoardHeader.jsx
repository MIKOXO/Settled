import { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Settings } from 'lucide-react';
import LockDecisionButton from './LockDecisionButton';
import ClaimOwnershipButton from './ClaimOwnershipButton';
import InviteButton from './InviteButton';
import BoardManageMenu from './BoardManageMenu';

/**
 * The board bar sits directly on the page background, flush between the app
 * nav and the tab bar — one chrome band instead of nav + card + tabs. The
 * owner's consequential action (lock) is the only solid coral element;
 * Manage and Invite are quiet ghost text beside it.
 */
const BoardHeader = ({ boardId }) => {
  const board = useSelector((state) => state.board.board);
  const options = useSelector((state) => state.board.options);
  const session = useSelector((state) => state.session);
  const [manageOpen, setManageOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  if (!board) return null;

  const { name, type, typeLabel, status } = board;
  const typeName = type === 'Custom' && typeLabel ? typeLabel : type;
  const decided = status === 'decided';
  const isOwner = session?.role === 'owner';
  const decidedOption = options.find((o) => o.id === board.decidedOptionId);

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="pb-3 pt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="truncate font-heading text-xl font-bold text-text-primary sm:text-2xl">
            {name}
          </h1>

          {typeName && (
            <span className="shrink-0 rounded-btn bg-surface px-2 py-0.5 font-sans text-xs text-text-muted">
              {typeName}
            </span>
          )}

          <span className="flex shrink-0 items-center gap-1.5 font-sans text-xs text-text-muted">
            {/* Undecided = the board is live and collecting signal, so the dot
                pulses; decided is final, so it sits solid in success mint. */}
            <span className="relative flex h-1.5 w-1.5">
              {!decided && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-secondary opacity-60" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  decided ? 'bg-success' : 'bg-accent-secondary'
                }`}
              />
            </span>
            <span className="capitalize">{status}</span>
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {isOwner && <LockDecisionButton />}
          <InviteButton />
          {isOwner && (
            <button
              type="button"
              onClick={() => setManageOpen((prev) => !prev)}
              aria-expanded={manageOpen}
              className={`flex items-center gap-1.5 rounded-btn px-2.5 py-2 font-sans text-sm transition-colors duration-200 ${
                manageOpen
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Settings className="h-4 w-4" />
              Manage
            </button>
          )}
          {!isOwner && <ClaimOwnershipButton boardId={boardId} />}
        </div>
      </div>

      {/* The lock lands live via socket for everyone on the board, so the
          strip earns a real entrance: it springs open instead of popping in. */}
      <AnimatePresence initial={false}>
        {decided && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={reduceMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-card border border-success/30 bg-success/10 px-4 py-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              <div className="min-w-0">
                <p className="font-sans text-xs font-medium text-success">Decision locked</p>
                <p className="truncate font-heading text-sm font-semibold text-text-primary">
                  {decidedOption?.title ?? 'Unknown option'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOwner && <BoardManageMenu open={manageOpen} onClose={() => setManageOpen(false)} />}
    </motion.header>
  );
};

export default BoardHeader;
