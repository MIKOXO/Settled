import { useEffect, useRef } from 'react';

/**
 * Dismisses a popover, dropdown, or disclosure on a click outside it or on
 * Escape. Listeners attach only while `active`, so a page with nothing open
 * isn't listening for every stray click.
 *
 * `mousedown` rather than `click`, so the dismissal lands *before* whatever the
 * target does on click — otherwise clicking another control both closes this one
 * and activates that one.
 *
 * The dismiss callback is held in a ref instead of a dependency: callers pass an
 * inline arrow, and re-subscribing on every render of an open menu is churn for
 * nothing.
 */
const useDismissable = (ref, active, onDismiss) => {
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active) return undefined;

    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) dismissRef.current();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') dismissRef.current();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, active]);
};

export default useDismissable;