// WHO may change an option: the board owner, or the participant who proposed it.
// Deliberately independent of `assertBoardOpen` — editing your own option stays
// legal on a decided board, so the two gates never travel together.
export const canManageOption = (participant, option) => {
  if (!participant || !option) return false;
  if (participant.role === 'owner') return true;
  return option.createdBy?.toString() === participant.id;
};