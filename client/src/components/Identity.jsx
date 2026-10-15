import initialsOf from '../utils/initials';

const AVATAR_SIZES = {
  xs: 'h-5 w-5 text-[8px]',
  sm: 'h-6 w-6 text-[9px]',
  md: 'h-8 w-8 text-[11px]',
};

/**
 * Who someone is, as a person: an initials avatar, a role badge, and the "you"
 * marker. Shared by the People tab and comment threads so a participant looks
 * the same wherever they appear.
 *
 * There are no uploaded avatars in the MVP, so the initials ARE the avatar.
 *
 * Built as a solid disc with no ring: a translucent fill plus a 1px ring
 * composites against whatever sits behind it and can leave a visible seam where
 * it meets the row it shares, so the owner's mustard is a stronger fill instead
 * and the disc simply clips its own contents.
 */
export const Avatar = ({ name, role, size = 'md', className = '' }) => (
  <span
    aria-hidden="true"
    title={name}
    className={`relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-mono font-semibold leading-none ${
      AVATAR_SIZES[size]
    } ${
      role === 'owner'
        ? 'bg-accent-secondary/25 text-accent-secondary'
        : 'bg-surface-2 text-text-muted'
    } ${className}`}
  >
    {initialsOf(name)}
  </span>
);

export const RoleBadge = ({ role }) =>
  role === 'owner' ? (
    <span className="shrink-0 rounded-btn bg-accent-secondary/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-accent-secondary">
      Owner
    </span>
  ) : (
    <span className="shrink-0 rounded-btn bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-text-muted">
      Member
    </span>
  );

export const YouChip = () => (
  <span className="shrink-0 rounded-btn bg-accent/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-accent">
    You
  </span>
);