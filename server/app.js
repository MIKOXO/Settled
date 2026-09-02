import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './src/config/env.js';
import healthRoutes from './src/routes/health.js';
import boardRoutes from './src/routes/board.js';
import { notFound } from './src/middleware/notFound.js';
import { errorHandler } from './src/middleware/errorHandler.js';

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

app.use(notFound);
app.use(errorHandler);

export default app;
