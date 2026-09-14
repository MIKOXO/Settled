import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { claimOwnership } from '../../services/board';
import { setSession } from '../../store/sessionSlice';

const ClaimOwnershipButton = ({ boardId }) => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!session || session.role === 'owner') return null;

  const handleClaim = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await claimOwnership(boardId);
      dispatch(setSession({ ...session, role: 'owner' }));
    } catch (err) {
      setError(err.message || 'Could not claim ownership');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="mb-3 font-sans text-sm text-text-muted">
        The current owner has been inactive. You can claim ownership to manage this board.
      </p>

      {error && (
        <p className="mb-3 rounded-btn bg-error/10 px-3 py-2 font-sans text-sm text-error">{error}</p>
      )}

      <button
        type="button"
        onClick={handleClaim}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-btn border border-accent bg-accent/10 px-4 py-2 font-sans text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent/20 disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {submitting ? 'Claiming...' : 'Claim ownership'}
      </button>
    </div>
  );
};

export default ClaimOwnershipButton;
