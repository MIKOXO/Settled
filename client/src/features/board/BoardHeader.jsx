import { useSelector } from 'react-redux';
import { CheckCircle2, Tags } from 'lucide-react';

const BoardHeader = () => {
  const board = useSelector((state) => state.board.board);

  if (!board) return null;

  const { name, type, typeLabel, status } = board;

  const typeName = type === 'Custom' && typeLabel ? typeLabel : type;
  const decided = status === 'decided';

  return (
    <header className="rounded-card border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            {name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            {typeName && (
              <span className="flex items-center gap-1.5 font-sans text-sm text-text-muted">
                <Tags className="h-4 w-4" />
                {typeName}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-sans text-sm text-text-muted">
              <span className={`h-2 w-2 rounded-full ${decided ? 'bg-success' : 'bg-accent-secondary'}`} />
              <span className="capitalize">{status}</span>
            </span>
          </div>
        </div>

        {decided && (
          <span className="flex items-center gap-2 rounded-btn border border-border bg-surface-2 px-3 py-1.5 font-sans text-sm text-text-muted">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Decided
          </span>
        )}
      </div>
    </header>
  );
};

export default BoardHeader;