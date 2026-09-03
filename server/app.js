import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './src/config/env.js';
import healthRoutes from './src/routes/health.js';
import boardRoutes from './src/routes/board.js';
import participantRoutes from './src/routes/participant.js';
import optionRoutes from './src/routes/option.js';
import voteRoutes from './src/routes/vote.js';
import commentRoutes from './src/routes/comment.js';
import { notFound } from './src/middleware/notFound.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(healthRoutes);
app.use('/api', boardRoutes);
app.use('/api', participantRoutes);
app.use('/api', optionRoutes);
app.use('/api', voteRoutes);
app.use('/api', commentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
