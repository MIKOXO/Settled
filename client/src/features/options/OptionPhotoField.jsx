import { useEffect, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

const inputClasses =
  'w-full rounded-btn border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors duration-200';

/**
 * The option's photo, as a labelled file input with an optional current
 * thumbnail. `previewUrl` is the signed URL of what's stored now, which only
 * the edit form has — a new option passes nothing and gets just the input.
 *
 * `onRemove` likewise only exists when there is something to remove; omitting it
 * hides the control rather than offering a no-op.
 */
const OptionPhotoField = ({ value, onChange, previewUrl, onRemove, idPrefix = 'option' }) => {
  const inputRef = useRef(null);

  // The parent clearing `value` after a successful save has to clear the native
  // input too, or it keeps showing a file that was already sent.
  useEffect(() => {
    if (!value && inputRef.current) inputRef.current.value = '';
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-sm font-medium text-text-muted">Photo</span>
        {previewUrl && !value && onRemove && (
          <span className="flex items-center gap-2">
            <span className="font-sans text-xs text-text-muted/60">Set</span>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove photo"
              title="Remove photo"
              className="flex h-7 w-7 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:bg-error/10 hover:text-error"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
        )}
      </div>

      {previewUrl && !value && (
        <img
          src={previewUrl}
          alt=""
          decoding="async"
          className="h-32 w-full rounded-btn border border-border object-cover sm:h-40"
        />
      )}

      <label
        htmlFor={`${idPrefix}-photo-input`}
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-btn border border-border bg-surface-2 px-3.5 py-2.5 font-sans text-sm transition-colors duration-200 hover:border-accent ${
          value ? 'text-text-primary' : 'text-text-muted/60'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ImagePlus className="h-4 w-4 shrink-0" />
          <span className="truncate">{value ? value.name : 'Choose a file'}</span>
        </span>
        <span className="shrink-0 font-sans text-xs text-text-muted">
          {previewUrl ? 'replace' : 'optional'}
        </span>
        <input
          id={`${idPrefix}-photo-input`}
          ref={inputRef}
          type="file"
          name="photo"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>
    </div>
  );
};

export default OptionPhotoField;