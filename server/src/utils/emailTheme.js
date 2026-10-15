/**
 * Shared chrome for every branded email.
 *
 * The app itself is dark-only, but a dark email body renders unreliably across
 * clients — so the brand is carried by a dark header band (the app's real
 * surfaces) sitting on top of a light content card. Colors are the app's tokens
 * recontextualized: `--accent-primary`/`--accent-secondary` stay untouched, the
 * text/background tokens are inverted, and — matching `bg-accent text-background`
 * on every primary button in the client — accents are labeled with near-black
 * ink, never white.
 *
 * Layout is table-based with inline styles only, because that is the single
 * subset every client renders. Colors are additionally mirrored by class in the
 * `<style>` block so a dark-mode client can flip to the app palette; the `!important`
 * there is what lets class rules win over the inline defaults.
 */

const BRAND = {
  band: '#1C1714',
  bandInk: '#F5F1E8',
  bandMuted: '#B8A99A',

  page: '#F4F1EC',
  card: '#FFFFFF',
  field: '#F4F1EC',

  ink: '#1F1A16',
  muted: '#6E6255',
  line: '#E9E2D8',

  coral: '#FF6B4A',
  mustard: '#F4B942',
  onAccent: '#171310',
};

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const HEADING_STACK =
  "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO_STACK =
  "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&amp;family=Plus+Jakarta+Sans:wght@400;500;600&amp;family=Sora:wght@600;700&amp;display=swap';

const STYLE = `
body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table,td{mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;border-collapse:collapse}
img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
a{color:inherit}
.e-btn:hover{filter:brightness(0.94)}
@media only screen and (max-width:560px){
.e-page-pad{padding:16px 8px!important}
.e-band-pad{padding:16px 18px!important}
.e-pad{padding:24px 18px 26px!important}
.e-h1{font-size:22px!important;line-height:28px!important}
.e-lede{font-size:16px!important;line-height:25px!important}
}
@media (prefers-color-scheme:dark){
.e-page{background-color:#171310!important}
.e-band{background-color:#2B221B!important}
.e-band-ink{color:#F5F1E8!important}
.e-band-mute{color:#B8A99A!important}
.e-card,.e-row{background-color:#221C17!important;border-color:#3A2F26!important}
.e-field{background-color:#2B221B!important;border-color:#3A2F26!important}
.e-ink{color:#F5F1E8!important}
.e-mute{color:#B8A99A!important}
.e-foot{color:#A08F80!important}
.e-line{border-color:#3A2F26!important}
}
`;

const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch]);

const coralDot = (size = 7) =>
  `<span aria-hidden="true" style="display:inline-block;width:${size}px;height:${size}px;border-radius:50%;background-color:${BRAND.coral};font-size:0;line-height:0;vertical-align:middle;"></span>`;

export const renderLayout = ({ preheader, eyebrow, content, footNote }) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Settled</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${FONT_LINK}" rel="stylesheet" />
    <style>${STYLE}</style>
  </head>
  <body class="e-page" style="margin:0;padding:0;background-color:${BRAND.page};font-family:${FONT_STACK};-webkit-text-size-adjust:100%;">
    <div class="e-pre" style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}&#8203;&#847;&#8203;&#847;</div>
    <table role="presentation" class="e-page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.page};">
      <tr>
        <td class="e-page-pad" align="center" style="padding:36px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
            <tr>
              <td class="e-card" style="background-color:${BRAND.card};border:1px solid ${BRAND.line};border-radius:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td class="e-band e-band-pad" style="background-color:${BRAND.band};border-radius:15px 15px 0 0;padding:20px 28px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td class="e-band-ink" align="left" style="font-family:${HEADING_STACK};font-size:19px;font-weight:600;line-height:24px;color:${BRAND.bandInk};">${coralDot()}&nbsp;Settled</td>
                          <td class="e-band-mute" align="right" valign="middle" style="padding-left:16px;font-family:${FONT_STACK};font-size:12px;font-weight:600;line-height:18px;color:${BRAND.bandMuted};white-space:nowrap;">${escapeHtml(eyebrow)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td class="e-pad" style="padding:30px 28px 32px;">
                      ${content}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 8px 0;">
                <p style="margin:0 0 6px;font-family:${HEADING_STACK};font-size:13px;font-weight:600;line-height:20px;color:${BRAND.muted};">${coralDot(6)}&nbsp;Settled</p>
                <p class="e-foot" style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${BRAND.muted};">${escapeHtml(footNote)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const heading = (text) =>
  `<p class="e-h1 e-ink" style="margin:0 0 10px;font-family:${HEADING_STACK};font-size:24px;font-weight:700;line-height:30px;letter-spacing:-0.01em;color:${BRAND.ink};">${escapeHtml(text)}</p>`;

export const lede = (text) =>
  `<p class="e-lede" style="margin:0;font-family:${FONT_STACK};font-size:15px;line-height:23px;color:${BRAND.muted};">${escapeHtml(text)}</p>`;

export const label = (text) =>
  `<p class="e-mute" style="margin:0 0 8px;font-family:${FONT_STACK};font-size:13px;line-height:19px;color:${BRAND.muted};">${escapeHtml(text)}</p>`;

export const note = (text) =>
  `<p class="e-mute" style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${BRAND.muted};">${escapeHtml(text)}</p>`;

export const chip = (text) =>
  `<span class="e-chip" style="display:inline-block;background-color:${BRAND.mustard};border-radius:999px;padding:5px 11px;font-family:${FONT_STACK};font-size:11px;font-weight:600;line-height:14px;letter-spacing:0.02em;color:${BRAND.onAccent};">${escapeHtml(text)}</span>`;

export const spacer = (height) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</td></tr></table>`;

export const rule = () =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="e-line" style="padding:0;border-top:1px solid ${BRAND.line};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

/**
 * Bulletproof primary button — coral fill, near-black label (the client puts
 * `text-background` on `bg-accent`), and a VML fallback because Outlook's HTML
 * engine drops background-color and padding on anchors.
 */
export const button = (text, url) => {
  const href = escapeHtml(url);
  const safeText = escapeHtml(text);

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="border-radius:8px;">
      <!--[if mso]>
      <v:roundrect href="${href}" style="height:48px;v-text-anchor:middle;width:320px;" arcsize="17%" stroke="f" fillcolor="${BRAND.coral}">
        <w:anchorlock/>
        <center style="color:${BRAND.onAccent};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${safeText}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a class="e-btn" href="${href}" target="_blank" style="display:block;background-color:${BRAND.coral};border-radius:8px;padding:14px 20px;font-family:${FONT_STACK};font-size:15px;font-weight:600;line-height:20px;color:${BRAND.onAccent};text-decoration:none;">${safeText}<span aria-hidden="true" style="font-size:15px;">&nbsp;&#8594;</span></a>
      <!--<![endif]-->
    </td>
  </tr>
</table>
`;
};

export const urlField = (url) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="e-field e-ink" style="background-color:${BRAND.field};border:1px solid ${BRAND.line};border-radius:8px;padding:12px 14px;font-family:${MONO_STACK};font-size:13px;line-height:20px;color:${BRAND.ink};word-break:break-all;overflow-wrap:break-word;">${escapeHtml(url)}</td>
  </tr>
</table>
`;

/**
 * One board in a list: name in the heading face, optional type chip on the same
 * row, then its own CTA. `index` renders a mono step numeral (the client's
 * convention for step numbers) but only when a list is actually numbered.
 */
export const boardCard = ({ name, tag, url, index, numbered }) => `
<tr>
  <td style="padding:0 0 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="e-row" style="background-color:${BRAND.card};border:1px solid ${BRAND.line};border-radius:12px;">
      <tr>
        <td style="padding:16px 18px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${
                numbered
                  ? `<td class="e-mute" width="28" valign="top" style="padding:2px 0 0;font-family:${MONO_STACK};font-size:13px;line-height:20px;color:${BRAND.muted};">${String(index + 1).padStart(2, '0')}</td>`
                  : ''
              }
              <td class="e-ink" valign="top" style="padding:0;font-family:${HEADING_STACK};font-size:16px;font-weight:600;line-height:22px;color:${BRAND.ink};word-break:break-word;">${escapeHtml(name)}</td>
              ${tag ? `<td align="right" valign="top" style="padding:2px 0 0 12px;white-space:nowrap;">${chip(tag)}</td>` : ''}
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 18px 16px;">${button('Open board', url)}</td>
      </tr>
    </table>
  </td>
</tr>
`;
