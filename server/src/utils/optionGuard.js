// WHO may change an option: the participant who proposed it, and nobody else.
// The board owner is not an exception — an owner who disagrees with a proposal
// argues it in the thread rather than rewriting it.
//
// Deliberately independent of `assertBoardOpen`, which answers WHEN: editing or
// removing your own option stays legal on a decided board, so the two gates
// never travel together.
export const canManageOption = (participant, option) => {
  if (!participant || !option) return false;
  return option.createdBy?.toString() === participant.id;
};