'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import MissionCard from '@/components/missions/MissionCard';
import { Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { Mission, Progress } from '@missionx/shared';

export default function MissionsPage() {
  const { user } = useAuthStore();

  const {
    data: missions,
    isLoading: missionsLoading,
    error: missionsError,
    refetch,
  } = useQuery({
    queryKey: ['missions'],
    queryFn: () => api.missions.getAll(),
  });

  const { data: progressList } = useQuery({
    queryKey: ['my-progress'],
    queryFn: () => api.progress.getMyList(),
    enabled: !!user,
  });

  // Map progress by missionId for quick card lookup
  const progressMap = React.useMemo(() => {
    const map = new Map<string, Progress>();
    if (progressList) {
      progressList.forEach((p) => {
        const id = typeof p.missionId === 'object' ? (p.missionId as any)._id : p.missionId;
        map.set(id.toString(), p);
      });
    }
    return map;
  }, [progressList]);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>SIMULATION ARCHIVE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Mission Library
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
          Select an active engineering mission. Each mission drops you into a virtual technical facility
          requiring environmental diagnostics, hardware telemetry verification, and staged problem solving.
        </p>
      </div>

      {/* Loading State */}
      {missionsLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading mission simulations from database...</p>
        </div>
      )}

      {/* Error State */}
      {missionsError && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-4 max-w-xl mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-rose-300">Failed to load missions</h3>
            <p className="text-xs text-rose-400/90 leading-relaxed">
              {(missionsError as any).message || 'Could not connect to the MissionX backend.'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-1.5 rounded-lg text-xs font-mono bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Missions Grid */}
      {!missionsLoading && !missionsError && missions && (
        <div>
          {missions.length === 0 ? (
            <div className="py-20 text-center glass-panel rounded-2xl border border-slate-800 p-8">
              <p className="text-sm text-slate-400">No missions currently published in the catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission: Mission) => (
                <MissionCard
                  key={mission._id}
                  mission={mission}
                  progress={progressMap.get(mission._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
