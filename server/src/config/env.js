import 'dotenv/config';

const REQUIRED = {
  PORT: { validate: (v) => /^\d+$/.test(v), hint: 'an integer port string' },
  MONGODB_URI: { validate: (v) => typeof v === 'string' && v.length > 0, hint: 'a non-empty MongoDB connection string' },
  JWT_SECRET: { validate: (v) => typeof v === 'string' && v.length > 0, hint: 'a non-empty JWT signing secret' },
  CLIENT_URL: { validate: (v) => typeof v === 'string' && v.length > 0, hint: 'a non-empty client origin URL' },
  NODE_ENV: { validate: (v) => typeof v === 'string' && v.length > 0, hint: 'development, test, or production' },
};

const missing = [];

for (const [key, { validate, hint }] of Object.entries(REQUIRED)) {
  const value = process.env[key];
  if (value === undefined || value === '' || !validate(value)) {
    missing.push(`${key} (expected ${hint})`);
  }
}

if (missing.length > 0) {
  throw new Error(
    `Environment configuration error: missing or invalid required variable(s): ${missing.join(', ')}. ` +
      'Set them in server/.env before starting the server.',
  );
}

const PORT = Number(process.env.PORT);

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV,
  PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,

  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL ?? process.env.FROM_EMAIL ?? process.env.EMAIL_USER,

  B2_KEY_ID: process.env.B2_KEY_ID,
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY,
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
  B2_ENDPOINT: process.env.B2_ENDPOINT,
  B2_REGION: process.env.B2_REGION,

  NOMINATIM_USER_AGENT:
    process.env.NOMINATIM_USER_AGENT ?? (process.env.NODE_ENV === 'production' ? 'Settled/1.0' : 'Settled/dev'),
});
