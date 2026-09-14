import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, Settings, Tags } from 'lucide-react';
import LockDecisionButton from './LockDecisionButton';
import ClaimOwnershipButton from './ClaimOwnershipButton';
import BoardManageMenu from './BoardManageMenu';

const BoardHeader = ({ boardId }) => {
  const board = useSelector((state) => state.board.board);
  const options = useSelector((state) => state.board.options);
  const session = useSelector((state) => state.session);
  const [manageOpen, setManageOpen] = useState(false);

  if (!board) return null;

  const { name, type, typeLabel, status } = board;
  const typeName = type === 'Custom' && typeLabel ? typeLabel : type;
  const decided = status === 'decided';
  const isOwner = session?.role === 'owner';
  const decidedOption = options.find((o) => o.id === board.decidedOptionId);

  return (
    <header className="rounded-card border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            {name}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {typeName && (
              <span className="flex items-center gap-1.5 font-sans text-sm text-text-muted">
                <Tags className="h-4 w-4" />
                {typeName}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-sans text-sm text-text-muted">
              <span
                className={`h-2 w-2 rounded-full ${decided ? 'bg-success' : 'bg-accent-secondary'}`}
              />
              <span className="capitalize">{status}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwner && <LockDecisionButton />}
          {isOwner && (
            <button
              type="button"
              onClick={() => setManageOpen((prev) => !prev)}
              aria-expanded={manageOpen}
              className={`flex items-center gap-2 rounded-btn border px-3.5 py-2 font-sans text-sm transition-colors duration-200 ${
                manageOpen
                  ? 'border-accent text-accent'
                  : 'border-border text-text-muted hover:border-accent/50 hover:text-text-primary'
              }`}
            >
              <Settings className="h-4 w-4" />
              Manage
            </button>
          )}
          {!isOwner && <ClaimOwnershipButton boardId={boardId} />}
        </div>
      </div>

      {decided && (
        <div className="mt-4 flex items-center gap-3 rounded-btn border border-success/30 bg-success/10 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0">
            <p className="font-sans text-xs font-medium text-success">Decision locked</p>
            <p className="truncate font-heading text-sm font-semibold text-text-primary">
              {decidedOption?.title ?? 'Unknown option'}
            </p>
          </div>
        </div>
      )}

      {isOwner && manageOpen && (
        <BoardManageMenu boardId={boardId} onClose={() => setManageOpen(false)} />
      )}
    </header>
  );
};

export default BoardHeader;
