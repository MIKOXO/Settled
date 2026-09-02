import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './src/config/env.js';
import healthRoutes from './src/routes/health.js';
import boardRoutes from './src/routes/board.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
  }),
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use(healthRoutes);
app.use('/api', boardRoutes);

app.use((err, _req, res, _next) => {
  const status =
    err.name === 'ZodError' ? 400 : (err.status ?? err.statusCode ?? 500);
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    success: false,
    data: null,
    error: status >= 500 ? 'Internal server error' : err.message,
  });
});

export default app;
