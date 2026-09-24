import axios from 'axios';
import { env } from '../config/env.js';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

const parseSender = (value) => {
  const match = String(value).match(/^([^<]*)<([^>]+)>$/);
  if (match) {
    const name = match[1].trim();
    return { email: match[2].trim(), ...(name ? { name } : {}) };
  }
  return { email: String(value).trim() };
};

export const sendEmail = async (to, subject, htmlContent, textContent) => {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) return;

  const sender = parseSender(env.BREVO_SENDER_EMAIL);

  await axios.post(
    BREVO_API,
    {
      sender,
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    },
    {
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    },
  );
};