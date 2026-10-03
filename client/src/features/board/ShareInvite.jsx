import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import InviteLinkDisplay from '../../components/InviteLinkDisplay';
import { buildInviteUrl } from '../../utils/inviteUrl';

const ShareInvite = ({ boardName, inviteToken }) => {
  const navigate = useNavigate();
  const session = useSelector((state) => state.session);

  const inviteUrl = buildInviteUrl(inviteToken);
  const boardId = session?.boardId;

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      {/* Success checkmark */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
        <Check className="h-8 w-8 text-success" />
      </div>

      <h1 className="font-heading text-3xl font-bold text-text-primary">
        Your board is ready
      </h1>
      <p className="mt-2 font-sans text-lg text-text-muted">
        {boardName}
      </p>

      {/* Invite link card */}
      <div className="mt-10 rounded-card bg-surface border border-border p-6">
        <p className="font-sans text-sm font-medium text-text-muted">
          Share this link with your group
        </p>

        <div className="mt-4">
          <InviteLinkDisplay url={inviteUrl} />
        </div>

        <p className="mt-3 font-sans text-xs text-text-muted">
          Anyone with this link can join — no account needed.
        </p>
      </div>

      {/* Continue into board */}
      {boardId && (
        <button
          type="button"
          onClick={() => navigate(`/board/${boardId}`)}
          className="mt-8 inline-flex items-center gap-2 rounded-btn bg-surface-2 border border-border px-6 py-3 font-sans text-sm font-semibold text-text-primary hover:border-accent transition-all duration-200"
        >
          Continue to board
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ShareInvite;
