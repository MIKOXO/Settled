import { createServer } from 'node:http';
import { Server } from 'socket.io';

import app from './app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { socketAuth } from './src/sockets/authMiddleware.js';
import { createConnectionHandler } from './src/sockets/connectionHandler.js';

const start = async () => {
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
    },
  });

  io.use(socketAuth);
  io.on('connection', createConnectionHandler(io));

  await connectDB();

  httpServer.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  return { httpServer, io };
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
