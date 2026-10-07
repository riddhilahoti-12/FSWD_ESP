'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  MissionState,
  InteractionResult,
  MissionEvent,
  UsedHintRecord,
} from '@missionx/shared';
import io from 'socket.io-client';

export function useMissionEngine(missionSlugOrId: string) {
  const [missionState, setMissionState] = useState<MissionState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<InteractionResult | null>(null);
  const [recentEvents, setRecentEvents] = useState<MissionEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch full authoritative state from backend
  const fetchState = useCallback(async () => {
    if (!missionSlugOrId) return;
    try {
      setIsLoading(true);
      setError(null);
      const state = await api.missions.getState(missionSlugOrId);
      setMissionState(state);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mission state');
    } finally {
      setIsLoading(false);
    }
  }, [missionSlugOrId]);

  // Execute an interaction with the mission engine
  const interact = useCallback(
    async (interactionId: string, payload: any = {}): Promise<InteractionResult | null> => {
      if (!missionState) return null;
      try {
        setIsInteracting(true);
        setError(null);

        const response = await api.missions.interact(
          missionState.slug,
          interactionId,
          payload
        );

        setLastResult(response.result);
        setMissionState(response.missionState);
        if (response.events?.length > 0) {
          setRecentEvents((prev) => [...response.events, ...prev].slice(0, 20));
        }

        return response.result;
      } catch (err: any) {
        setError(err.message || 'Interaction failed');
        return null;
      } finally {
        setIsInteracting(false);
      }
    },
    [missionState]
  );

  // Request a hint with score penalty
  const requestHint = useCallback(
    async (hintId: string): Promise<UsedHintRecord | null> => {
      if (!missionState) return null;
      try {
        setIsInteracting(true);
        setError(null);

        const response = await api.missions.useHint(missionState.slug, hintId);
        setMissionState(response.missionState);

        if (response.events?.length > 0) {
          setRecentEvents((prev) => [...response.events, ...prev].slice(0, 20));
        }

        return response.hint;
      } catch (err: any) {
        setError(err.message || 'Failed to unlock hint');
        return null;
      } finally {
        setIsInteracting(false);
      }
    },
    [missionState]
  );

  // Initial load
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Socket.IO event listener for real-time multiplayer / simulation updates
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('mission:event', (event: MissionEvent) => {
      if (missionState && (event.missionId === missionState.missionId || event.missionId === missionState.slug)) {
        setRecentEvents((prev) => [event, ...prev].slice(0, 20));
        // Refresh authoritative state on stage completion or unlock
        if (
          event.type === 'STAGE_COMPLETED' ||
          event.type === 'OBJECT_UNLOCKED' ||
          event.type === 'DOOR_UNLOCKED' ||
          event.type === 'MISSION_COMPLETED'
        ) {
          fetchState();
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [missionState, fetchState]);

  return {
    missionState,
    isLoading,
    isInteracting,
    lastResult,
    recentEvents,
    error,
    interact,
    requestHint,
    refreshState: fetchState,
  };
}
