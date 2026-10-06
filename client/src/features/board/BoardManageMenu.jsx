import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import BoardSettingsForm from './BoardSettingsForm';

// Settings only — participant management lives in the People tab so the whole
// board can see the roster, not just the owner.
//
// Owns its own AnimatePresence rather than letting the header unmount it
// conditionally: exit animations only run while the motion element is still
// mounted, so the parent has to keep this component alive and hand it `open`.
const BoardManageMenu = ({ open, onClose }) => {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // Matches the Invite popover exactly, so the header's two
          // disclosures feel like one system. Scaling from the top edge lines
          // up with the y-offset: the panel settles down onto the page.
          initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          // One card, not card-in-card: the panel IS the settings form, at the
          // same width as the options column below it.
          className="mt-4 max-w-3xl origin-top rounded-card border border-border bg-surface p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-accent" />
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                Board settings
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close manage panel"
              className="flex h-8 w-8 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <BoardSettingsForm />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BoardManageMenu;