import FieldError from '../../components/FieldError';
import OptionLocationPicker from './OptionLocationPicker';
import OptionPhotoField from './OptionPhotoField';

const inputClasses =
  'w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors duration-200';

/**
 * Every field of an option, in one order and one grid, shared by the propose and
 * edit forms so the two can't drift apart — an option that gains a field appears
 * in both, at the same place, with the same label.
 *
 * Presentational and fully controlled: it holds no state of its own beyond the
 * file input's reset, and decides nothing about when a change is sent.
 *
 * `onChange(name, value)` fires per field; `location` is reported the same way as
 * the rest so the caller decides what an untouched place means.
 */
const OptionFields = ({
  idPrefix = 'option',
  values,
  onChange,
  errors = {},
  photo = null,
  onPhotoChange,
  photoPreviewUrl = null,
  onRemovePhoto,
}) => {
  const { title, notes, link, location } = values;
  const field = (name) => `${idPrefix}-${name}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label
          htmlFor={field('title')}
          className="mb-1.5 block font-sans text-sm font-medium text-text-muted"
        >
          Title <span className="text-accent">*</span>
        </label>
        <input
          id={field('title')}
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="e.g. Saturday night kayaking on the lake"
          className={inputClasses}
          autoFocus
        />
        <FieldError message={errors.title} />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor={field('notes')}
          className="mb-1.5 block font-sans text-sm font-medium text-text-muted"
        >
          Notes
        </label>
        <textarea
          id={field('notes')}
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Anything else worth knowing"
          className={`${inputClasses} resize-y`}
        />
      </div>

      <div>
        <label
          htmlFor={field('link')}
          className="mb-1.5 block font-sans text-sm font-medium text-text-muted"
        >
          Link
        </label>
        <input
          id={field('link')}
          type="url"
          maxLength={500}
          value={link}
          onChange={(e) => onChange('link', e.target.value)}
          placeholder="https://"
          className={inputClasses}
        />
        <FieldError message={errors.link} />
      </div>

      <div>
        <OptionPhotoField
          value={photo}
          onChange={onPhotoChange}
          previewUrl={photoPreviewUrl}
          onRemove={onRemovePhoto}
          idPrefix={idPrefix}
        />
      </div>

      <div className="sm:col-span-2">
        <p className="mb-1.5 font-sans text-sm font-medium text-text-muted">
          Location <span className="font-normal text-text-muted/60">optional</span>
        </p>
        <OptionLocationPicker value={location} onChange={(next) => onChange('location', next)} />
      </div>
    </div>
  );
};

export default OptionFields;