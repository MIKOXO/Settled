import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings, Loader2, Check } from 'lucide-react';
import Select from '../../components/Select';
import { updateBoard } from '../../services/board';
import { setBoard } from '../../store/boardSlice';

const BOARD_TYPES = [
  { value: '', label: 'No type', icon: null },
  { value: 'Trip', label: 'Trip', icon: null },
  { value: 'Dinner', label: 'Dinner', icon: null },
  { value: 'Event', label: 'Event', icon: null },
  { value: 'Custom', label: 'Custom', icon: null },
];

const BoardSettingsForm = () => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const board = useSelector((state) => state.board.board);

  const [name, setName] = useState(board?.name ?? '');
  const [type, setType] = useState(board?.type ?? '');
  const [optionsOwnerOnly, setOptionsOwnerOnly] = useState(board?.optionsOwnerOnly ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  if (!session || session.role !== 'owner' || !board) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        optionsOwnerOnly,
      };
      if (type) payload.type = type;
      else payload.type = undefined;

      const updated = await updateBoard(board.id, payload);
      dispatch(setBoard(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-4 w-4 text-text-muted" />
        <h3 className="font-heading text-sm font-semibold text-text-primary">Board settings</h3>
      </div>

      <div>
        <label htmlFor="settings-name" className="mb-1.5 block font-sans text-xs font-medium text-text-muted">
          Board name
        </label>
        <input
          id="settings-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-btn border border-border bg-surface-2 px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors duration-200"
        />
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block font-sans text-xs font-medium text-text-muted">Type</label>
        <Select
          name="settings-type"
          value={type}
          onChange={setType}
          options={BOARD_TYPES}
          placeholder="No type"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-sans text-sm font-medium text-text-primary">Options: owner only</p>
          <p className="font-sans text-xs text-text-muted">Only the owner can propose options</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={optionsOwnerOnly}
          onClick={() => setOptionsOwnerOnly(!optionsOwnerOnly)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            optionsOwnerOnly ? 'bg-accent' : 'bg-surface-2'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-text-primary shadow-lg transition-transform duration-200 ${
              optionsOwnerOnly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-btn bg-error/10 px-3 py-2 font-sans text-sm text-error">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-4 py-2 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : null}
        {submitting ? 'Saving...' : saved ? 'Saved' : 'Save settings'}
      </button>
    </form>
  );
};

export default BoardSettingsForm;
