import { useSelector } from 'react-redux';

/**
 * Whether the current participant may propose a new option, mirroring the
 * server's `requireCanCreateOption` gate — owner-only boards are the only
 * setting that restricts creation, and a decided board closes it off entirely.
 *
 * Shared by every entry point into proposing (the options tab composer and the
 * map's "Propose as option" handoff) so a member can never reach a form that
 * the server will 403.
 *
 * `blockedReason` is null exactly when proposing is allowed, so callers can use
 * it directly as the explanation shown next to a disabled control.
 */
const useCanProposeOption = () => {
  const optionsOwnerOnly = useSelector(
    (state) => state.board.board?.optionsOwnerOnly ?? false,
  );
  const decided = useSelector((state) => state.board.board?.status === 'decided');
  const role = useSelector((state) => state.session?.role);

  let blockedReason = null;
  if (optionsOwnerOnly && role !== 'owner') {
    blockedReason = 'Only the board owner can add options.';
  } else if (decided) {
    blockedReason = "This board's decision is locked — no new options.";
  }

  return { canPropose: blockedReason === null, blockedReason };
};

export default useCanProposeOption;