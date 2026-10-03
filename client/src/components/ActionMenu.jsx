import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import useDismissable from '../hooks/useDismissable';

/**
 * Icon-triggered overflow menu: one quiet button that opens a small floating
 * list of actions. Used where two or more actions on the same object would
 * otherwise sit side by side in a row that already has other controls in it.
 *
 * Items are `{ label, icon, onSelect, danger }`. The menu closes on selection,
 * on a click outside, and on Escape — picking an action and leaving the menu
 * hanging open behind it is never what the click meant.
 *
 * Scaled down from its top edge rather than faded in place, matching the header's
 * manage panel and invite popover, so every disclosure in the product settles
 * the same way. `prefers-reduced-motion` gets the state change without the
 * transform.
 */
const ActionMenu = ({ items, icon, triggerLabel, align = 'right' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useDismissable(rootRef, open, () => setOpen(false));

  const handleSelect = (onSelect) => {
    setOpen(false);
    onSelect();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={triggerLabel}
        aria-label={triggerLabel}
        className="rounded-btn p-1.5 text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
      >
        {icon}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={triggerLabel}
            initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-30 mt-1 w-40 origin-top rounded-card border border-border bg-surface-2 p-1 shadow-xl shadow-black/40 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(item.onSelect)}
                className={`flex w-full items-center gap-2 rounded-btn px-3 py-2 font-sans text-sm transition-colors duration-150 ${
                  item.danger
                    ? 'text-error hover:bg-error/10'
                    : 'text-text-primary hover:bg-surface'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionMenu;