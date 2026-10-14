import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Loader2, Save, X } from 'lucide-react';
import {
  deleteOptionPhoto,
  fetchOptions,
  updateOption,
  uploadOptionPhoto,
} from '../../services/options';
import { setOptions, updateOptionDetails } from '../../store/boardSlice';
import ErrorBanner from '../../components/ErrorBanner';
import useFormErrors from '../../hooks/useFormErrors';
import { mapValidationIssues } from '../../utils/validationErrors';
import { toLocationPayload } from '../../utils/optionLocation';
import OptionFields from './OptionFields';

/**
 * In-place editor for an existing option, opened from the card's pencil control.
 *
 * Same fields, same order, same grid as the propose form — `OptionFields` owns
 * that, so the two can't drift.
 *
 * Only what was touched is sent. The place is a separate Location document, so
 * an untouched one is left out of the PATCH rather than round-tripped; a photo
 * rides its own endpoint because it's a multipart upload.
 *
 * Emptied notes/link go out as `null`, not omitted: the PATCH schema treats null
 * as "clear this field", so leaving them out would make them impossible to empty
 * once set.
 */
const EditOptionForm = ({ option, onDone }) => {
  const dispatch = useDispatch();
  const { boardId } = useParams();
  const [fields, setFields] = useState({
    title: option.title ?? '',
    notes: option.notes ?? '',
    link: option.link ?? '',
    location: option.location ?? null,
  });
  const [locationTouched, setLocationTouched] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [dropPhoto, setDropPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    blockError,
    fieldErrors,
    setFieldErrors,
    setBlockError,
    clearBlockError,
  } = useFormErrors();

  const { title, notes, link, location } = fields;

  const handleChange = (name, value) => {
    if (name === 'location') {
      setLocationTouched(true);
      setFields((prev) => ({ ...prev, location: value }));
      return;
    }
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (file) => {
    setPhoto(file);
    // Choosing a replacement supersedes removing the current one.
    if (file) setDropPhoto(false);
  };

  // Removal is an intent applied on save, exactly like the place: choosing one
  // and then cancelling has to leave the option untouched.
  const handleRemovePhoto = () => {
    setDropPhoto(true);
    setPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearBlockError();
    setFieldErrors({});

    if (!title.trim()) {
      setBlockError('Please give your option a title.');
      return;
    }

    const patch = {
      title: title.trim(),
      notes: notes.trim() || null,
      link: link.trim() || null,
      ...(locationTouched ? { location: toLocationPayload(location) } : {}),
    };

    setSubmitting(true);

    try {
      let result = await updateOption(option.id, patch);

      if (photo) {
        result = await uploadOptionPhoto(option.id, photo);
      } else if (dropPhoto) {
        result = await deleteOptionPhoto(option.id);
      }

      // The PATCH and photo endpoints answer with the raw doc — locationId
      // unpopulated, no signed URL — so a change to either of those refetches
      // the list, which carries the enriched shape the card and its map pin
      // need. Text-only edits patch in place and skip the request.
      if (photo || dropPhoto || locationTouched) {
        const refreshed = await fetchOptions(boardId);
        dispatch(setOptions(refreshed.options));
      } else {
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
      }

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

      <OptionFields
        idPrefix={`option-${option.id}`}
        values={fields}
        onChange={handleChange}
        errors={fieldErrors}
        photo={photo}
        onPhotoChange={handlePhotoChange}
        photoPreviewUrl={dropPhoto ? null : option.photoUrl}
        onRemovePhoto={handleRemovePhoto}
      />

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