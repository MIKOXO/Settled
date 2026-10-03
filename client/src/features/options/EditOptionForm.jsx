import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Loader2, Save, X } from 'lucide-react';
import { updateOption } from '../../services/options';
import { updateOptionDetails } from '../../store/boardSlice';
import ErrorBanner from '../../components/ErrorBanner';
import FieldError from '../../components/FieldError';
import useFormErrors from '../../hooks/useFormErrors';
import { mapValidationIssues } from '../../utils/validationErrors';

const inputClasses =
  'w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors duration-200';

/**
 * In-place editor for an existing option, opened from the card's pencil control.
 *
 * Scope is the text fields only — title, notes, link. The location lives on a
 * separate Location document and editing it means re-picking on a map, which
 * doesn't belong inside a card; that's a change for the option form, not here.
 *
 * Emptied notes/link are sent as `null` rather than omitted: the PATCH schema
 * treats null as "clear this field", so leaving them out would make the fields
 * impossible to empty once set.
 */
const EditOptionForm = ({ option, onDone }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(option.title ?? '');
  const [notes, setNotes] = useState(option.notes ?? '');
  const [link, setLink] = useState(option.link ?? '');
  const [submitting, setSubmitting] = useState(false);
  const {
    blockError,
    fieldErrors,
    setFieldErrors,
    setBlockError,
    clearBlockError,
  } = useFormErrors();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearBlockError();
    setFieldErrors({});

    if (!title.trim()) {
      setBlockError('Please give your option a title.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await updateOption(option.id, {
        title: title.trim(),
        notes: notes.trim() || null,
        link: link.trim() || null,
      });

      dispatch(
        updateOptionDetails({
          optionId: option.id,
          changes: {
            title: result.option.title,
            notes: result.option.notes,
            link: result.option.link,
          },
        }),
      );
      onDone();
    } catch (err) {
      const mapped = mapValidationIssues(err.issues);

      if (mapped) {
        setFieldErrors(mapped);
        setBlockError('Please fix the highlighted fields and try again.');
      } else {
        setBlockError(err.message || 'Could not save the option');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="font-sans text-sm font-medium text-text-primary">Edit option</p>
        <button
          type="button"
          onClick={onDone}
          disabled={submitting}
          aria-label="Cancel editing"
          className="flex h-8 w-8 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ErrorBanner message={blockError} onDismiss={clearBlockError} />

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`option-title-${option.id}`}
            className="mb-1.5 block font-sans text-sm font-medium text-text-muted"
          >
            Title <span className="text-accent">*</span>
          </label>
          <input
            id={`option-title-${option.id}`}
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClasses}
            autoFocus
          />
          <FieldError message={fieldErrors.title} />
        </div>

        <div>
          <label
            htmlFor={`option-notes-${option.id}`}
            className="mb-1.5 block font-sans text-sm font-medium text-text-muted"
          >
            Notes
          </label>
          <textarea
            id={`option-notes-${option.id}`}
            rows={3}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClasses} resize-y`}
          />
        </div>

        <div>
          <label
            htmlFor={`option-link-${option.id}`}
            className="mb-1.5 block font-sans text-sm font-medium text-text-muted"
          >
            Link
          </label>
          <input
            id={`option-link-${option.id}`}
            type="url"
            maxLength={500}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            className={inputClasses}
          />
          <FieldError message={fieldErrors.link} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-btn px-4 py-2.5 font-sans text-sm font-semibold transition-all duration-200 ${
          title.trim() && !submitting
            ? 'bg-accent text-background hover:brightness-110'
            : 'cursor-not-allowed bg-surface-2 text-text-muted/60'
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Save changes
            <Save className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
};

export default EditOptionForm;