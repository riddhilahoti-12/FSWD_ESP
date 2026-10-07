import {
  RegisterInput,
  LoginInput,
  SafeUser,
  Mission,
  Progress,
  ApiResponse,
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
      request<Progress>(`/missions/${id}/start`, {
        method: 'POST',
      }),
  },

  progress: {
    getMyList: () => request<Progress[]>('/progress/my'),
    getByMission: (missionId: string) => request<Progress | null>(`/progress/${missionId}`),
  },

  health: {
    check: () => request<{ status: string; system: string; services: Record<string, string> }>('/health'),
  },
};
