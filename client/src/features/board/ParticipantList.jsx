import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, X, Loader2 } from 'lucide-react';
import { removeParticipant } from '../../services/board';
import { setParticipants } from '../../store/boardSlice';

const ParticipantList = ({ boardId }) => {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.session);
  const participants = useSelector((state) => state.board.participants);
  const [confirmId, setConfirmId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  if (!session || session.role !== 'owner') return null;

  const handleRemove = async (participantId) => {
    setRemovingId(participantId);
    try {
      await removeParticipant(boardId, participantId);
      dispatch(setParticipants(participants.filter((p) => p.id !== participantId)));
      setConfirmId(null);
    } catch {
      setConfirmId(null);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-text-muted" />
        <h3 className="font-heading text-sm font-semibold text-text-primary">
          Participants
        </h3>
        <span className="ml-auto font-mono text-xs text-text-muted">
          {participants.length}
        </span>
      </div>

      <ul className="space-y-1">
        {participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-btn px-3 py-2 hover:bg-surface-2 transition-colors duration-150"
          >
            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-medium text-text-primary">
                {p.displayName}
              </p>
              <p className="font-sans text-xs text-text-muted capitalize">{p.role}</p>
            </div>

            {p.id !== session.id && (
              <>
                {confirmId === p.id ? (
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs text-error">Remove?</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      disabled={removingId === p.id}
                      className="rounded-btn bg-error/15 px-2 py-1 font-sans text-xs font-medium text-error transition-colors duration-150 hover:bg-error/25 disabled:opacity-50"
                    >
                      {removingId === p.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Yes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-btn bg-surface-2 px-2 py-1 font-sans text-xs font-medium text-text-muted transition-colors duration-150 hover:text-text-primary"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(p.id)}
                    className="rounded-btn p-1.5 text-text-muted transition-colors duration-150 hover:bg-error/10 hover:text-error"
                    title="Remove participant"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {participants.length <= 1 && (
        <p className="mt-2 font-sans text-xs text-text-muted">
          No other participants yet.
        </p>
      )}
    </div>
  );
};

export default ParticipantList;
