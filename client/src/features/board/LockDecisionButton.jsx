import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { lockDecision } from '../../services/board';
import { setBoard } from '../../store/boardSlice';

const LockDecisionButton = () => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const board = useSelector((state) => state.board.board);
  const options = useSelector((state) => state.board.options);
  const [selectedId, setSelectedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!session || session.role !== 'owner' || !board) return null;

  const decided = board.status === 'decided';

  if (decided) {
    const decidedOption = options.find((o) => o.id === board.decidedOptionId);
    return (
      <div className="flex items-center gap-3 rounded-card border border-success/30 bg-success/10 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <div className="min-w-0">
          <p className="font-sans text-xs font-medium text-success">Decision locked</p>
          <p className="truncate font-heading text-sm font-semibold text-text-primary">
            {decidedOption?.title ?? 'Unknown option'}
          </p>
        </div>
      </div>
    );
  }

  const leadingOptions = options.filter((o) => o.isLeading);
  const defaultOption = leadingOptions[0] ?? options[0];

  const handleLock = async () => {
    const optionId = selectedId || defaultOption?.id;
    if (!optionId) return;

    setError(null);
    setSubmitting(true);
    try {
      const result = await lockDecision(board.id, optionId);
      dispatch(setBoard(result));
    } catch (err) {
      setError(err.message || 'Failed to lock decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="mb-3 font-sans text-sm font-medium text-text-primary">Lock in a decision</p>

      {options.length > 0 ? (
        <select
          value={selectedId || defaultOption?.id || ''}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-btn border border-border bg-surface-2 px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent transition-colors duration-200"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}{o.isLeading ? ' (leading)' : ''}
            </option>
          ))}
        </select>
      ) : (
        <p className="font-sans text-xs text-text-muted">No options to decide on yet.</p>
      )}

      {error && (
        <p className="mt-2 rounded-btn bg-error/10 px-3 py-2 font-sans text-sm text-error">{error}</p>
      )}

      <button
        type="button"
        onClick={handleLock}
        disabled={submitting || options.length === 0}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-4 py-2 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {submitting ? 'Locking...' : 'Lock decision'}
      </button>
    </div>
  );
};

export default LockDecisionButton;
