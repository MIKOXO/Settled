import { useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * The Yes/No half of a two-step destructive action, exported on its own so a
 * caller whose trigger lives somewhere else — an overflow menu, say — can hand
 * the confirm step the same look without inventing a second one.
 *
 * Presentational: it renders `busy` and calls back. Deciding when to show it, and
 * when to take it away again, belongs to whoever owns that state.
 */
export const ConfirmActions = ({
  onConfirm,
  onCancel,
  question = 'Delete?',
  confirmLabel = 'Yes',
  busy = false,
  busyLabel,
}) => (
  <div className="flex shrink-0 items-center gap-2">
    <span className="font-sans text-xs text-error">{question}</span>
    <button
      type="button"
      onClick={onConfirm}
      disabled={busy}
      aria-label={busy ? busyLabel : undefined}
      className="rounded-btn bg-error/15 px-2 py-1 font-sans text-xs font-medium text-error transition-colors duration-150 hover:bg-error/25 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : confirmLabel}
    </button>
    <button
      type="button"
      onClick={onCancel}
      disabled={busy}
      className="rounded-btn bg-surface-2 px-2 py-1 font-sans text-xs font-medium text-text-muted transition-colors duration-150 hover:text-text-primary disabled:opacity-50"
    >
      No
    </button>
  </div>
);

/**
 * Two-step destructive action, shared by every irreversible control in the
 * product (participant removal, option removal).
 *
 * Nothing happens on the first click: the trigger is quiet and in-place, and
 * asking swaps it for an explicit Yes/No pair. No modal — the row it lives in
 * is small, and a confirm that moves the target is worse than one that stays put.
 *
 * `onConfirm` owns the work and the failure path. A rejection still dismisses
 * the confirm state (so the control can't get stuck open), and the caller is
 * free to surface its own error.
 */
const ConfirmButton = ({
  onConfirm,
  question = 'Delete?',
  confirmLabel = 'Yes',
  icon,
  triggerLabel,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } catch {
      // The caller's own error path has already run by now; the confirm step
      // still stands down either way so the control can't get stuck open.
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <ConfirmActions
        question={question}
        confirmLabel={confirmLabel}
        busy={busy}
        busyLabel={triggerLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={triggerLabel}
      aria-label={triggerLabel}
      className="shrink-0 rounded-btn p-1.5 text-text-muted transition-colors duration-150 hover:bg-error/10 hover:text-error"
    >
      {icon}
    </button>
  );
};

export default ConfirmButton;