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
import telemetryRoutes from './routes/telemetry.routes';
import iotRoutes from './routes/iot.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { TelemetryService } from './services/iot/TelemetryService';
import { IoTService } from './services/iot/IoTService';

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

// 4. Socket.IO Setup
export const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect TelemetryService to Socket.IO
TelemetryService.setSocketServer(io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Room Join for Mission Real-time Telemetry
  socket.on('join:mission', (data: { missionId: string }) => {
    if (data?.missionId) {
      const room = `mission:${data.missionId}`;
      socket.join(room);
      console.log(`[Socket.IO] ${socket.id} joined ${room}`);

      // Instantly transmit latest telemetry snapshot to joining client
      const latest = TelemetryService.getLatestTelemetry(data.missionId);
      if (latest) {
        socket.emit('iot:telemetry', {
          type: 'iot:telemetry',
          telemetry: latest,
        });
      }
    }
  });

  socket.on('leave:mission', (data: { missionId: string }) => {
    if (data?.missionId) {
      socket.leave(`mission:${data.missionId}`);
    }
  });

  socket.on('join:device', (data: { deviceId: string }) => {
    if (data?.deviceId) {
      socket.join(`device:${data.deviceId}`);
    }
  });

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
        iotEngine: 'SIMULATED_ACTIVE',
      },
    },
  });
});

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/iot', iotRoutes);

// 7. Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Bootstrap Server
export async function startServer(): Promise<void> {
  try {
    await connectDB();
    await IoTService.init();

    server.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 MissionX API Server running on http://localhost:${env.PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`📡 Socket.IO: Initialized with IoT Telemetry Rooms`);
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
