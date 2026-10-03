import { useState } from 'react';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';
import { ConfirmActions } from '../../components/ConfirmButton';

/**
 * An option card's overflow menu — one quiet trigger instead of an edit icon and
 * a delete icon sharing a row with vote, discuss, and map.
 *
 * Deleting an option also drops its votes, comments, and map pin, and none of
 * that is reversible, so the menu's delete item doesn't act on its own: it hands
 * off to the same two-step confirm the People tab uses for participant removal,
 * shown in place of the trigger.
 */
const OptionActions = ({ onEdit, onDelete }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      // The card is still on screen with its content intact — the confirm step
      // standing down is the whole recovery here.
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  if (confirmingDelete) {
    return (
      <ConfirmActions
        question="Delete?"
        busy={deleting}
        busyLabel="Deleting option"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    );
  }

  return (
    <ActionMenu
      icon={<Ellipsis className="h-4 w-4" />}
      triggerLabel="Option actions"
      items={[
        {
          label: 'Edit option',
          icon: <Pencil className="h-4 w-4" />,
          onSelect: onEdit,
        },
        {
          label: 'Delete option',
          icon: <Trash2 className="h-4 w-4" />,
          danger: true,
          onSelect: () => setConfirmingDelete(true),
        },
      ]}
    />
  );
};

export default OptionActions;