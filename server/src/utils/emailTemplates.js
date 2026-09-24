const BRAND = {
  coral: '#FF6B4A',
  mustard: '#F4B942',
  pageBg: '#F4F1EC',
  cardBg: '#FFFFFF',
  text: '#1F1A16',
  muted: '#7A6E5F',
  border: '#E9E2D8',
  inkOnMustard: '#1F1A16',
  buttonText: '#FFFFFF',
};

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Settled</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BRAND.pageBg};font-family:${FONT_STACK};-webkit-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.pageBg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <span style="font-family:${FONT_STACK};font-size:22px;font-weight:700;line-height:26px;color:${BRAND.text};">Settled<span style="color:${BRAND.coral};">&#9679;</span></span>
              </td>
            </tr>
            <tr>
              <td style="background-color:${BRAND.cardBg};border:1px solid ${BRAND.border};border-radius:16px;padding:32px 28px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:16px;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${BRAND.muted};">
                Sent by Settled &mdash; the shared decision board for your group.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const primaryButton = (label, url) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="border-radius:8px;">
        <a href="${url}" target="_blank" style="display:block;background-color:${BRAND.coral};border-radius:8px;padding:13px 16px;font-family:${FONT_STACK};font-size:16px;font-weight:600;line-height:20px;color:${BRAND.buttonText};text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>
`;

const typeTag = (label) => `
  <span style="display:inline-block;background-color:${BRAND.mustard};border-radius:8px;padding:4px 10px;font-family:${FONT_STACK};font-size:12px;font-weight:600;line-height:16px;color:${BRAND.inkOnMustard};">${label}</span>
`;

const boardTypeLabel = (board) => board.typeLabel || board.type || null;

export const buildBoardCreatedEmail = ({ boardName, inviteUrl, recoveryUrl, board }) => {
  const subject = `Your board '${boardName}' is ready`;
  const safeName = escapeHtml(boardName);
  const tag = board ? boardTypeLabel(board) : null;
  const safeTag = tag ? escapeHtml(tag) : null;

  const html = baseLayout(`
    ${safeTag ? `<p style="margin:0 0 12px;font-family:${FONT_STACK};">${typeTag(safeTag)}</p>` : ''}
    <h1 style="margin:0 0 8px;font-family:${FONT_STACK};font-size:22px;font-weight:700;line-height:28px;color:${BRAND.text};">${safeName}</h1>
    <p style="margin:0 0 28px;font-family:${FONT_STACK};font-size:15px;line-height:22px;color:${BRAND.muted};">Welcome to Settled. Your board is live &mdash; open it when you're ready to decide, or share the link below to bring people in.</p>
    ${primaryButton('Open your board', escapeHtml(recoveryUrl))}
    <p style="margin:16px 0 0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${BRAND.muted};">This recovery link expires in 15 minutes.</p>
    <div style="border-bottom:1px solid ${BRAND.border};margin:28px 0 20px;"></div>
    <p style="margin:0 0 6px;font-family:${FONT_STACK};font-size:13px;line-height:19px;color:${BRAND.muted};">Private invite link &mdash; share this so people can join:</p>
    <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:20px;color:${BRAND.text};background-color:${BRAND.pageBg};border-radius:8px;padding:12px 14px;word-break:break-all;overflow-wrap:break-word;">${escapeHtml(inviteUrl)}</p>
  `);

  const text = [
    `Your board "${boardName}" is ready`,
    '',
    `Welcome to Settled. "${boardName}" is live and ready for decisions.`,
    '',
    'Open your board:',
    recoveryUrl,
    `Private invite link \u2014 share this so people can join:`,
    inviteUrl,
    '',
    'This recovery link expires in 15 minutes.',
  ].join('\n');

  return { subject, html, text };
};

export const buildRecoveryEmail = ({ boards }) => {
  const multiple = boards.length > 1;
  const subject = multiple ? 'Your Settled boards' : 'Access your board';
  const intro = multiple
    ? 'We found a few boards tied to your email. Pick the one you want to open:'
    : 'Your recovery link is ready \u2014 open it to pick up where you left off.';

  const rows = boards
    .map((board) => {
      const tag = boardTypeLabel(board);
      const safeName = escapeHtml(board.name);
      const safeTag = tag ? escapeHtml(tag) : null;
      return `
        <tr>
          <td style="border:1px solid ${BRAND.border};border-radius:16px;padding:20px;background-color:${BRAND.cardBg};">
            <p style="margin:0 0 ${safeTag ? '8px' : '16px'};font-family:${FONT_STACK};font-size:16px;font-weight:700;line-height:22px;color:${BRAND.text};">${safeName}</p>
            ${safeTag ? `<p style="margin:0 0 16px;font-family:${FONT_STACK};">${typeTag(safeTag)}</p>` : ''}
            ${primaryButton('Open board', escapeHtml(board.url))}
          </td>
        </tr>`;
    })
    .join('<tr><td style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>');

  const html = baseLayout(`
    <h1 style="margin:0 0 12px;font-family:${FONT_STACK};font-size:20px;font-weight:700;line-height:26px;color:${BRAND.text};">${multiple ? 'Your boards' : 'Access your board'}</h1>
    <p style="margin:0 0 28px;font-family:${FONT_STACK};font-size:15px;line-height:22px;color:${BRAND.muted};">${intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${rows}
    </table>
    <p style="margin:20px 0 0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${BRAND.muted};">Each link expires in 15 minutes.</p>
  `);

  const text = [
    subject,
    '',
    intro,
    '',
    ...boards.flatMap((board, i) => {
      const tag = boardTypeLabel(board);
      const heading = multiple ? `${i + 1}. ${board.name}` : board.name;
      return [heading + (tag ? ` (${tag})` : ''), `Open board: ${board.url}`, ''];
    }).slice(0, -1),
    'Each link expires in 15 minutes.',
  ].join('\n');

  return { subject, html, text };
};