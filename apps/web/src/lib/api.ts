import {
  RegisterInput,
  LoginInput,
  SafeUser,
  Mission,
  Progress,
  ApiResponse,
  MissionState,
  InteractionResult,
  MissionEvent,
  UsedHintRecord,
  IoTTelemetry,
  IoTCommandInput,
  IoTDevice,
  SimulationMode,
} from '@missionx/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('missionx_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      code: 'PARSER_ERROR',
      message: 'Failed to parse JSON response from server',
    },
  }));

  if (!data.success) {
    throw new ApiError(data.error.message, data.error.code, data.error.details);
  }

  return data.data;
}

export const api = {
  auth: {
    register: (payload: RegisterInput) =>
      request<{ token: string; user: SafeUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: LoginInput) =>
      request<{ token: string; user: SafeUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),

    getMe: () => request<{ user: SafeUser }>('/auth/me'),
  },

  missions: {
    getAll: () => request<Mission[]>('/missions'),
    getBySlug: (slug: string) => request<Mission>(`/missions/${slug}`),
    start: (id: string) =>
      request<MissionState>(`/missions/${id}/start`, {
        method: 'POST',
      }),
    getState: (missionId: string) =>
      request<MissionState>(`/missions/${missionId}/state`),
    interact: (missionId: string, interactionId: string, payload: any = {}) =>
      request<{ result: InteractionResult; missionState: MissionState; events: MissionEvent[] }>(
        `/missions/${missionId}/interactions/${interactionId}`,
        {
          method: 'POST',
          body: JSON.stringify({ payload }),
        }
      ),
    useHint: (missionId: string, hintId: string) =>
      request<{ hint: UsedHintRecord; missionState: MissionState; events: MissionEvent[] }>(
        `/missions/${missionId}/hints/${hintId}/use`,
        {
          method: 'POST',
        }
      ),
  },

  progress: {
    getMyList: () => request<Progress[]>('/progress/my'),
    getByMission: (missionId: string) => request<Progress | null>(`/progress/${missionId}`),
  },

  telemetry: {
    getLatest: (missionId: string) => request<IoTTelemetry>(`/telemetry/${missionId}`),
    getHistory: (missionId: string, limit: number = 30) =>
      request<IoTTelemetry[]>(`/telemetry/${missionId}/history?limit=${limit}`),
  },

  iot: {
    sendCommand: (command: IoTCommandInput) =>
      request<{ success: boolean; message: string }>('/iot/commands', {
        method: 'POST',
        body: JSON.stringify(command),
      }),
    getDevices: () => request<IoTDevice[]>('/iot/devices'),
    getDevice: (deviceId: string) =>
      request<IoTDevice & { telemetry: IoTTelemetry | null }>(`/iot/devices/${deviceId}`),
    setSimulationMode: (deviceId: string, mode: SimulationMode) =>
      request<{ success: boolean; message: string }>('/iot/simulation/mode', {
        method: 'POST',
        body: JSON.stringify({ deviceId, mode }),
      }),
  },

  health: {
    check: () =>
      request<{ status: string; system: string; services: Record<string, string> }>('/health'),
  },
};
