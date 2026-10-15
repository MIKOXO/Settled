import {
  boardCard,
  button,
  chip,
  heading,
  label,
  lede,
  note,
  renderLayout,
  rule,
  spacer,
  urlField,
} from './emailTheme.js';

const FOOT_NOTE =
  'A board, then a decision. You are receiving this because you created or joined a Settled board.';

const boardTypeLabel = (board) => board.typeLabel || board.type || null;

export const buildBoardCreatedEmail = ({ boardName, inviteUrl, welcomeUrl, board }) => {
  const subject = `Your board '${boardName}' is ready`;
  const tag = board ? boardTypeLabel(board) : null;

  const html = renderLayout({
    preheader: `"${boardName}" is live. Open your board, or share the invite link with your group.`,
    eyebrow: 'Board created',
    footNote: FOOT_NOTE,
    content: `
      ${tag ? `<div style="margin:0 0 14px;">${chip(tag)}</div>` : ''}
      ${heading(boardName)}
      ${lede(
        'Welcome to Settled. Your board is live \u2014 open it when you\u2019re ready to decide, or share the link below to bring people in.',
      )}
      ${spacer(24)}
      ${button('Open your board', welcomeUrl)}
      ${spacer(28)}
      ${rule()}
      ${spacer(22)}
      ${label('Private invite link \u2014 share this so people can join')}
      ${urlField(inviteUrl)}
      ${spacer(10)}
      ${note('Anyone with this link can join \u2014 no account needed.')}
    `,
  });

  const text = [
    `Your board "${boardName}" is ready`,
    '',
    `Welcome to Settled. "${boardName}" is live and ready for decisions.`,
    '',
    'Open your board:',
    welcomeUrl,
    '',
    'Private invite link \u2014 share this so people can join:',
    inviteUrl,
    'Anyone with this link can join \u2014 no account needed.',
  ].join('\n');

  return { subject, html, text };
};

export const buildRecoveryEmail = ({ boards }) => {
  const multiple = boards.length > 1;
  const subject = multiple ? 'Your Settled boards' : 'Access your board';
  const intro = multiple
    ? `We found ${boards.length} boards tied to your email. Pick the one you want to open.`
    : 'Your recovery link is ready \u2014 open it to pick up where you left off.';

  const rows = boards
    .map((board, index) =>
      boardCard({
        name: board.name,
        tag: boardTypeLabel(board),
        url: board.url,
        index,
        numbered: multiple,
      }),
    )
    .join('');

  const html = renderLayout({
    preheader: multiple
      ? `${boards.length} Settled boards are tied to your email. Open the one you need.`
      : 'Your Settled sign-in link is ready.',
    eyebrow: multiple ? `${boards.length} boards` : 'Access link',
    footNote: FOOT_NOTE,
    content: `
      ${heading(multiple ? 'Your boards' : 'Access your board')}
      ${spacer(6)}
      ${lede(intro)}
      ${spacer(24)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rows}
      </table>
      ${note('Each link expires in 15 minutes.')}
    `,
  });

  const text = [
    subject,
    '',
    intro,
    '',
    ...boards
      .map((board, i) => {
        const tag = boardTypeLabel(board);
        const boardLine = multiple ? `${i + 1}. ${board.name}` : board.name;
        return `${boardLine}${tag ? ` (${tag})` : ''}\nOpen board: ${board.url}`;
      }),
    '',
    'Each link expires in 15 minutes.',
  ].join('\n');

  return { subject, html, text };
};
