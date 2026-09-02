import axios from 'axios';
import { env } from '../config/env.js';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

export const sendMagicLinkEmail = async (email, recoveryToken) => {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) return;

  const recoveryUrl = `${env.CLIENT_URL}/recover?token=${recoveryToken}`;

  await axios.post(
    BREVO_API,
    {
      sender: { email: env.BREVO_SENDER_EMAIL },
      to: [{ email }],
      subject: 'Recover your Settled session',
      htmlContent: `
        <p>You requested a recovery link for Settled.</p>
        <p><a href="${recoveryUrl}">Click here to recover your session</a></p>
        <p>This link expires in 15 minutes.</p>
      `,
    },
    {
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    },
  );
};
