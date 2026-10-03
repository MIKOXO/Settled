// WHO may change an option after it exists. The board owner can (they own the
// board's outcome) and so can the participant who proposed it (it may be their
// own typo, a dead link, or an idea they changed their mind about). Everyone
// else on the board is read-only for other people's options.
//
// Deliberately separate from `assertBoardOpen`, which answers WHEN. Editing or
// removing an option stays legal on a decided board — the owner locking a
// decision doesn't retroactively strip participants of their own proposals —
// so the two gates never travel together.
//
// Shared by option edit, option delete, and photo upload: same rule, three
// routes, and authorization duplicated across routes drifts.
export const canManageOption = (participant, option) => {
  if (!participant || !option) return false;
  if (participant.role === 'owner') return true;
  return option.createdBy?.toString() === participant.id;
};