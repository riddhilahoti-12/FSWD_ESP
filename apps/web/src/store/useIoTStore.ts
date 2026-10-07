'use client';

import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';
import {
  IoTTelemetry,
  SensorReading,
  ActuatorState,
  IoTDeviceStatus,
  SimulationMode,
  IoTCommandInput,
} from '@missionx/shared';
import { api } from '@/lib/api';

interface IoTStoreState {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: IoTDeviceStatus;
  activeMissionId: string | null;
  telemetry: IoTTelemetry | null;
  sensors: SensorReading;
  actuators: ActuatorState;
  simulationMode: SimulationMode;
  history: IoTTelemetry[];
  lastError: string | null;

  // Actions
  initSocket: (missionId: string) => void;
  leaveSocket: () => void;
  fetchLatest: (missionId: string) => Promise<void>;
  fetchHistory: (missionId: string) => Promise<void>;
  sendCommand: (command: IoTCommandInput) => Promise<{ success: boolean; message: string }>;
  setSimulationMode: (deviceId: string, mode: SimulationMode) => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_SENSORS: SensorReading = {
  temperatureC: 31.8,
  humidityPct: 68.0,
  waterDetected: false,
  voltage: 0.0,
};

const DEFAULT_ACTUATORS: ActuatorState = {
  fan: true,
  warningLed: true,
  buzzer: false,
  breakerTripped: false,
};

export const useIoTStore = create<IoTStoreState>((set, get) => ({
  socket: null,
  isConnected: false,
  connectionStatus: 'SIMULATED',
  activeMissionId: null,
  telemetry: null,
  sensors: DEFAULT_SENSORS,
  actuators: DEFAULT_ACTUATORS,
  simulationMode: 'OVERHEATING',
  history: [],
  lastError: null,

  initSocket: (missionId: string) => {
    const currentSocket = get().socket;
    if (currentSocket && get().activeMissionId === missionId) {
      return; // Already connected to this mission room
    }

    if (currentSocket) {
      currentSocket.disconnect();
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
      'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      set({ isConnected: true, connectionStatus: 'SIMULATED', lastError: null });
      socket.emit('join:mission', { missionId });
      // Fetch latest state immediately upon connect/reconnect
      get().fetchLatest(missionId);
    });

    socket.on('disconnect', () => {
      set({ isConnected: false, connectionStatus: 'OFFLINE' });
    });

    socket.on('connect_error', () => {
      set({ isConnected: false, connectionStatus: 'OFFLINE' });
    });

    socket.on('iot:telemetry', (data: { telemetry: IoTTelemetry }) => {
      if (data?.telemetry) {
        const t = data.telemetry;
        set((state) => ({
          telemetry: t,
          sensors: { ...t.sensors },
          actuators: { ...t.actuators },
          simulationMode: t.simulationMode || state.simulationMode,
          history: [...state.history, t].slice(-30),
        }));
      }
    });

    set({ socket, activeMissionId: missionId });
  },

  leaveSocket: () => {
    const { socket, activeMissionId } = get();
    if (socket && activeMissionId) {
      socket.emit('leave:mission', { missionId: activeMissionId });
      socket.disconnect();
    }
    set({ socket: null, isConnected: false, activeMissionId: null });
  },

  fetchLatest: async (missionId: string) => {
    try {
      const data = await api.telemetry.getLatest(missionId);
      if (data) {
        set((state) => ({
          telemetry: data,
          sensors: { ...data.sensors },
          actuators: { ...data.actuators },
          simulationMode: data.simulationMode || state.simulationMode,
        }));
      }
    } catch (err: any) {
      // Offline fallback: keep current defaults
    }
  },

  fetchHistory: async (missionId: string) => {
    try {
      const history = await api.telemetry.getHistory(missionId, 30);
      set({ history });
    } catch (err: any) {
      // Ignored
    }
  },

  sendCommand: async (command: IoTCommandInput) => {
    try {
      const res = await api.iot.sendCommand(command);
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'Command transmission failed' };
    }
  },

  setSimulationMode: async (deviceId: string, mode: SimulationMode) => {
    try {
      const res = await api.iot.setSimulationMode(deviceId, mode);
      set({ simulationMode: mode });
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'Simulation mode change failed' };
    }
  },
}));
