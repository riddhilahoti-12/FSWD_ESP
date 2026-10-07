import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import missionRoutes from './routes/mission.routes';
import progressRoutes from './routes/progress.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const server = http.createServer(app);

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS
app.use(
  cors({
    origin: env.CLIENT_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Socket.IO Setup (Foundation for future phases)
export const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// 5. System Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ONLINE',
      system: 'MissionX API & Escape Room Engine',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      services: {
        database: 'CONNECTED',
        socketServer: 'READY',
      },
    },
  });
});

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/progress', progressRoutes);

// 7. Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Bootstrap Server
export async function startServer(): Promise<void> {
  try {
    await connectDB();
    server.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 MissionX API Server running on http://localhost:${env.PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`📡 Socket.IO: Initialized`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export { app, server };
