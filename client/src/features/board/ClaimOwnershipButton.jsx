import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { claimOwnership } from '../../services/board';
import { setSession } from '../../store/sessionSlice';

const ClaimOwnershipButton = ({ boardId }) => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!error) return undefined;

    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setError(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [error]);

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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleClaim}
        disabled={submitting}
        title="Only available once the current owner has been inactive past the threshold"
        className="flex items-center gap-2 rounded-btn border border-border px-3.5 py-2 font-sans text-sm text-text-muted transition-colors duration-200 hover:border-accent hover:text-text-primary disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {submitting ? 'Claiming...' : 'Claim ownership'}
      </button>

      {error && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-card border border-error/30 bg-surface-2 p-3 shadow-xl shadow-black/40">
          <p className="font-sans text-xs text-error">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ClaimOwnershipButton;
