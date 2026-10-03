import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import InviteLinkDisplay from '../../components/InviteLinkDisplay';
import { buildInviteUrl } from '../../utils/inviteUrl';

/**
 * The invite link, reachable from inside the board rather than only from the
 * one-time post-creation screen. Not owner-gated — FR3 puts no restriction on
 * who can share a board link, and on a group board it is often a participant,
 * not the owner, who pulls the rest of the group in. Deliberately quiet: the
 * header's coral belongs to the owner's lock action.
 */
const InviteButton = () => {
  const board = useSelector((state) => state.board.board);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const inviteUrl = board?.inviteToken ? buildInviteUrl(board.inviteToken) : null;

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (!inviteUrl) return null;

  // The popover is anchored to the command bar, which wraps to its own
  // left-aligned row below `sm` and sits flush right above it — so the anchor
  // side has to flip with the breakpoint, or it hangs off the left edge on a
  // phone.
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-btn px-2.5 py-2 font-sans text-sm transition-colors duration-200 ${
          open ? 'text-accent' : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <UserPlus className="h-4 w-4" />
        Invite
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            // A short fade-and-settle, not a flourish: per ui-context.md
            // motion outside the real-time re-rank stays minimal. The scale
            // originates at the trigger edge so the panel reads as growing out
            // of the button rather than materializing in place.
            initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top rounded-card border border-border bg-surface-2 p-4 shadow-xl shadow-black/40 sm:right-0 sm:left-auto sm:origin-top-right"
          >
            <p className="mb-3 font-sans text-xs text-text-muted">
              Anyone with this link can join — no account needed.
            </p>
            <InviteLinkDisplay url={inviteUrl} size="sm" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InviteButton;