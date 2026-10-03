export const buildInviteUrl = (inviteToken) =>
  inviteToken ? `${window.location.origin}/join/${inviteToken}` : null;
