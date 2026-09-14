import { Settings, X } from 'lucide-react';
import BoardSettingsForm from './BoardSettingsForm';
import ParticipantList from './ParticipantList';

const BoardManageMenu = ({ boardId, onClose }) => {
  return (
    <div className="mt-4 rounded-card border border-border bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-text-muted" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">
            Manage board
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close manage panel"
          className="flex h-8 w-8 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BoardSettingsForm />
        <ParticipantList boardId={boardId} />
      </div>
    </div>
  );
};

export default BoardManageMenu;
