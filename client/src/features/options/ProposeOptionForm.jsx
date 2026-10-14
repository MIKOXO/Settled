import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, Lock, Plus, X } from 'lucide-react';
import { createOption, uploadOptionPhoto, fetchOptions } from '../../services/options';
import { addOption, setOptions } from '../../store/boardSlice';
import ErrorBanner from '../../components/ErrorBanner';
import useFormErrors from '../../hooks/useFormErrors';
import useCanProposeOption from '../../hooks/useCanProposeOption';
import OptionFields from './OptionFields';
import { toLocationPayload } from '../../utils/optionLocation';

const EMPTY = { title: '', notes: '', link: '', location: null };

// The trigger stays on screen but inert whenever adding isn't available:
// removing it entirely would leave the panel looking like options can still be
// added, while a live button invites a submit that the server 403s. Same shape
// as the collapsed trigger, muted out, with the reason stated underneath.
const LockedTrigger = ({ reason }) => (
  <div className="mb-5">
    <button
      type="button"
      disabled
      title={reason}
      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-btn border border-dashed border-border px-3.5 py-2 font-sans text-sm text-text-muted/40"
    >
      <Plus className="h-4 w-4" />
      Add an option
    </button>
    <p className="mt-2 flex items-center gap-1.5 font-sans text-xs text-text-muted/70">
      <Lock className="h-3.5 w-3.5 shrink-0" />
      {reason}
    </p>
  </div>
);

const ProposeOptionForm = ({ prefill }) => {
  const dispatch = useDispatch();
  const { boardId } = useParams();
  const { canPropose, blockedReason } = useCanProposeOption();
  const reduceMotion = useReducedMotion();
  const [fields, setFields] = useState(EMPTY);
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const { blockError, setBlockError, clearBlockError } = useFormErrors();
  const { title, notes, link, location } = fields;

  // A place handed over from the map tab's details panel. BoardPage mints a
  // fresh `prefill` object per handoff, so re-proposing the same place still
  // re-applies. The seed is null, not `prefill`: this form unmounts whenever
  // the tab changes, so it often mounts *already holding* a prefill and must
  // still apply it. A handoff also opens the collapsed form so the carried
  // place is actually visible.
  const [seenPrefill, setSeenPrefill] = useState(null);
  if (prefill && prefill !== seenPrefill) {
    setSeenPrefill(prefill);
    setFields((prev) => ({
      ...prev,
      title: prefill.title ?? prev.title,
      location: {
        lat: prefill.lat,
        lng: prefill.lng,
        placeName: prefill.placeName ?? null,
        placeSource: prefill.placeSource ?? 'manual',
      },
    }));
    setOpen(true);
  }

  // Proposing is closed either way when the board blocks it: the trigger stays
  // on screen but inert, so the panel never looks like options can still be
  // added and never offers a form that 403s on submit.
  if (!canPropose) {
    return <LockedTrigger reason={blockedReason} />;
  }

  const handleChange = (name, value) =>
    setFields((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearBlockError();

    if (!title.trim()) {
      setBlockError('Please give your option a title.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await createOption(boardId, {
        title: title.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        ...(link.trim() ? { link: link.trim() } : {}),
        ...(location ? { location: toLocationPayload(location) } : {}),
      });

      let option = result.option;

      if (photo) {
        const photoResult = await uploadOptionPhoto(option.id, photo);
        option = photoResult.option;
      }

      // The create endpoint returns the raw doc — locationId unpopulated —
      // so a location-attached create refetches like the photo path: the list
      // endpoint returns the enriched location the card's pin button needs.
      if (photo || location) {
        const refreshed = await fetchOptions(boardId);
        dispatch(setOptions(refreshed.options));
      } else {
        dispatch(addOption({
          ...option,
          score: 0,
          isLeading: false,
          vote: null,
          photoUrl: null,
          location: null,
        }));
      }

      setFields(EMPTY);
      setPhoto(null);
      setOpen(false);
    } catch (err) {
      setBlockError(err.message || 'Could not add the option');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-btn border border-dashed border-border px-3.5 py-2 font-sans text-sm text-text-muted transition-colors duration-200 hover:border-accent/60 hover:text-text-primary"
        >
          <Plus className="h-4 w-4" />
          Add an option
        </button>
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="mb-5 rounded-card border border-border bg-surface p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-accent" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Propose an option
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the form"
          className="flex h-8 w-8 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ErrorBanner message={blockError} onDismiss={clearBlockError} />

      <OptionFields
        values={fields}
        onChange={handleChange}
        photo={photo}
        onPhotoChange={setPhoto}
      />

      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-btn px-4 py-2.5 font-sans text-sm font-semibold transition-all duration-200 ${
          title.trim() && !submitting
            ? 'bg-accent text-background hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed'
            : 'cursor-not-allowed bg-surface-2 text-text-muted/60'
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            Add option
            <Plus className="h-4 w-4" />
          </>
        )}
      </button>
    </motion.form>
  );
};

export default ProposeOptionForm;