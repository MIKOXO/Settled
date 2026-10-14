import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const SWIPE_DISTANCE = 60;

const IconButton = ({ label, onClick, children, autoFocus = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    data-autofocus={autoFocus ? '' : undefined}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2/70 text-text-muted backdrop-blur-md transition-colors duration-200 hover:bg-surface-2 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    {children}
  </button>
);

/**
 * Full-bleed photo viewer: the first modal in the product, so it follows the
 * spec ui-context.md has been holding open — centred, backdrop-blurred,
 * `rounded-modal`. Nothing renders until `index` points at a real photo, so the
 * caller can keep a plain id in state and let the list decide what's open.
 *
 * Portalled to the body because option cards carry Framer layout transforms; a
 * `fixed` overlay inside one would be positioned against the card, not the
 * viewport.
 */
const Lightbox = ({ photos, index, onIndexChange, onClose, caption }) => {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const draggedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const photo = photos[index];
  const multiple = photos.length > 1;

  const step = useCallback(
    (delta) => onIndexChange((index + delta + photos.length) % photos.length),
    [index, photos.length, onIndexChange],
  );

  // A new photo means a new load and a fresh, un-zoomed frame.
  useEffect(() => {
    setLoaded(false);
    setZoomed(false);
  }, [index]);

  // Hand focus back to whatever opened the viewer — the card's thumbnail.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement;
    return () => {
      if (restoreFocusRef.current instanceof HTMLElement) restoreFocusRef.current.focus();
    };
  }, []);

  useEffect(() => {
    panelRef.current?.querySelector('[data-autofocus]')?.focus();
  }, []);

  // Scroll lock, padding-compensated so the board underneath doesn't jump when
  // the scrollbar disappears. The only imperative style writes in the feature —
  // this is DOM state, not styling.
  useEffect(() => {
    const { body } = document;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, []);

  // Pull the neighbours in so arrowing through a board of photos doesn't flash.
  useEffect(() => {
    for (const delta of [-1, 1]) {
      const neighbour = photos[index + delta];
      if (neighbour?.src) new Image().src = neighbour.src;
    }
  }, [index, photos]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (multiple && e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
        return;
      }

      if (multiple && e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
        return;
      }

      // Tab cycles inside the dialog instead of escaping to the board behind it.
      if (e.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [multiple, onClose, step]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={caption ? `${caption} — photo` : 'Photo'}
      ref={panelRef}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? false : { opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      // Only a press that lands on the backdrop itself closes — the figure sits
      // inside an inset layer that is pointer-events-none, so presses in the
      // empty space around the photo fall through to here.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* mode="wait" so the outgoing photo leaves before the next arrives —
            side by side in one flex row they would read as a broken layout. */}
        <AnimatePresence mode="wait">
          <motion.figure
            key={photo.id}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-full max-w-full flex-col items-center gap-3"
          >
            <div
              className={`pointer-events-auto flex items-center justify-center rounded-modal border border-border bg-surface-2/60 ${
                zoomed
                  ? 'max-h-full max-w-full cursor-zoom-out overflow-auto'
                  : 'max-h-full overflow-hidden'
              }`}
            >
              <motion.img
                src={photo.src}
                alt={caption ?? ''}
                decoding="async"
                // Native drag would raise a ghost image over the drag handler.
                draggable={false}
                drag={reduceMotion || zoomed ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={() => {
                  draggedRef.current = true;
                }}
                onDragEnd={(_, info) => {
                  // Swipe is for navigating; the release must not also count as
                  // a click and toggle the zoom it just navigated away from.
                  draggedRef.current = false;
                  if (info.offset.x <= -SWIPE_DISTANCE) step(1);
                  else if (info.offset.x >= SWIPE_DISTANCE) step(-1);
                }}
                onLoad={() => setLoaded(true)}
                onClick={() => {
                  if (!draggedRef.current) setZoomed((z) => !z);
                }}
                animate={{ opacity: loaded ? 1 : 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`select-none object-contain ${
                  zoomed
                    ? 'h-auto w-[200%] max-w-none cursor-zoom-out'
                    : 'h-auto max-h-[78vh] w-auto max-w-full cursor-zoom-in'
                }`}
              />
            </div>

            {(caption || multiple) && (
              <figcaption className="flex w-full items-center justify-between gap-4 rounded-btn bg-surface-2/70 px-3 py-2 backdrop-blur-md">
                <span className="truncate font-sans text-xs text-text-primary">
                  {caption}
                </span>
                {multiple && (
                  <span className="shrink-0 font-mono text-xs text-text-muted">
                    {index + 1} / {photos.length}
                  </span>
                )}
              </figcaption>
            )}
          </motion.figure>
        </AnimatePresence>
      </div>

      {/* Above the figure, which is pointer-events-none apart from the photo
          itself, so drags and backdrop presses reach the overlay underneath. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-3 sm:p-6">
        {multiple && (
          <span className="pointer-events-auto">
            <IconButton label="Previous photo" onClick={() => step(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </IconButton>
          </span>
        )}

        <span className="pointer-events-auto absolute right-3 top-3 sm:right-6 sm:top-6">
          <IconButton label="Close photo" onClick={onClose} autoFocus>
            <X className="h-5 w-5" />
          </IconButton>
        </span>
      </div>

      <span
        className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface-2/70 px-2.5 py-1 font-sans text-[11px] text-text-muted backdrop-blur-md sm:flex"
        aria-hidden="true"
      >
        {zoomed ? (
          <>
            <ZoomOut className="h-3 w-3" />
            Click to fit
          </>
        ) : (
          <>
            <ZoomIn className="h-3 w-3" />
            Click to zoom · Esc to close
          </>
        )}
      </span>
    </motion.div>
  );
};

const PhotoLightbox = ({ photos = [], index = -1, onIndexChange, onClose, caption }) => {
  const open = index >= 0 && index < photos.length;

  return createPortal(
    <AnimatePresence>
      {open && (
        <Lightbox photos={photos} index={index} onIndexChange={onIndexChange} onClose={onClose} caption={caption} />
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PhotoLightbox;