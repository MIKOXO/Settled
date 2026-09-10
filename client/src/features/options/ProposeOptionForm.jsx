import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Loader2, Lock, Plus } from 'lucide-react';
import { createOption, uploadOptionPhoto, fetchOptions } from '../../services/options';
import { addOption, setOptions } from '../../store/boardSlice';
import ErrorBanner from '../../components/ErrorBanner';
import useFormErrors from '../../hooks/useFormErrors';

const inputClasses =
  'w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors duration-200';

const ProposeOptionForm = () => {
  const dispatch = useDispatch();
  const { boardId } = useParams();
  const session = useSelector((state) => state.session);
  const optionsOwnerOnly = useSelector((state) => state.board.board?.optionsOwnerOnly ?? false);
  const canCreate = !optionsOwnerOnly || session?.role === 'owner';

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { blockError, setBlockError, clearBlockError } = useFormErrors();

  if (!canCreate) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-btn border border-border bg-surface px-4 py-3">
        <Lock className="h-4 w-4 shrink-0 text-text-muted" />
        <p className="font-sans text-sm text-text-muted">
          Only the board owner can add options.
        </p>
      </div>
    );
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoName(file ? file.name : '');
  };

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
      });

      let option = result.option;

      if (photo) {
        const photoResult = await uploadOptionPhoto(option.id, photo);
        option = photoResult.option;
      }

      if (photo) {
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

      setTitle('');
      setNotes('');
      setLink('');
      setPhoto(null);
      setPhotoName('');
      e.target.photo.value = '';
    } catch (err) {
      setBlockError(err.message || 'Could not add the option');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-card border border-border bg-surface p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4 text-accent" />
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Propose an option
        </h2>
      </div>

      <ErrorBanner message={blockError} onDismiss={clearBlockError} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="option-title" className="mb-1.5 block font-sans text-sm font-medium text-text-muted">
            Title <span className="text-accent">*</span>
          </label>
          <input
            id="option-title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Saturday night kayaking on the lake"
            className={inputClasses}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="option-notes" className="mb-1.5 block font-sans text-sm font-medium text-text-muted">
            Notes
          </label>
          <textarea
            id="option-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else worth knowing"
            className={`${inputClasses} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="option-link" className="mb-1.5 block font-sans text-sm font-medium text-text-muted">
            Link
          </label>
          <input
            id="option-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="option-photo" className="mb-1.5 block font-sans text-sm font-medium text-text-muted">
            Photo
          </label>
          <label
            htmlFor="option-photo-input"
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-btn border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-sm transition-colors duration-200 hover:border-accent ${
              photoName ? 'text-text-primary' : 'text-text-muted/60'
            }`}
          >
            <span className="truncate">{photoName || 'Choose a file'}</span>
            <span className="shrink-0 font-sans text-xs text-text-muted">optional</span>
            <input
              id="option-photo-input"
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
          </label>
        </div>
      </div>

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
    </form>
  );
};

export default ProposeOptionForm;