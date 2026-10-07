'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import {
  Compass,
  Zap,
  CheckCircle2,
  PlayCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Layers,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Progress, Mission } from '@missionx/shared';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Protect route
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  const { data: progressList, isLoading: progressLoading } = useQuery({
    queryKey: ['my-progress'],
    queryFn: () => api.progress.getMyList(),
    enabled: !!token,
  });

  if (authLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading student profile...</p>
        </div>
      </div>
    );
  }

  // Filter missions
  const inProgressList = progressList?.filter((p) => p.status === 'IN_PROGRESS') || [];
  const completedList = progressList?.filter((p) => p.status === 'COMPLETED') || [];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              CADET PROFILE // {user.role}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="text-cyan-400">{user.name}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your real-time challenge unlocks, simulated IoT hardware achievements, and
            active escape room missions.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/missions"
            className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center space-x-2 transition-all shadow-glow-cyan"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Missions</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Experience</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {user.stats?.xp ?? 0} <span className="text-xs text-cyan-400 font-normal">XP</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">In Progress</span>
            <PlayCircle className="w-4 h-4 text-electric-blue" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {inProgressList.length}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {completedList.length}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Missions Started</span>
            <TrendingUp className="w-4 h-4 text-electric-violet" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {user.stats?.missionsStarted ?? progressList?.length ?? 0}
          </div>
        </div>
      </div>

      {/* Main Content: Current Missions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Missions (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Active Missions</span>
            </h2>
            <Link
              href="/missions"
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>Browse Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {progressLoading ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              Loading progress records...
            </div>
          ) : inProgressList.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4">
              <p className="text-sm text-slate-300">
                You do not have any missions in progress right now.
              </p>
              <Link
                href="/missions/rescue-the-server-room"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/25 transition-all"
              >
                <span>Launch "Rescue the Server Room"</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressList.map((prog: Progress) => {
                const mission = prog.missionId as unknown as Mission;
                return (
                  <div
                    key={prog._id}
                    className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          STAGE {prog.currentStage}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {mission?.domain || 'IoT Systems'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {mission?.title || 'Unknown Mission'}
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md line-clamp-1">
                        {mission?.briefing || 'Telemetry diagnostics in progress...'}
                      </p>
                    </div>

                    <Link
                      href={`/missions/${mission?.slug || 'rescue-the-server-room'}`}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 flex items-center space-x-2 shadow-glow-cyan whitespace-nowrap"
                    >
                      <span>CONTINUE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Activity & Diagnostics */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Cadet Accreditations</span>
          </h2>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Environmental Telemetry</span>
                <span className="text-cyan-400 font-mono font-bold">ACTIVE</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400 w-3/4 rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Embedded Logic & Actuators</span>
                <span className="text-electric-blue font-mono font-bold">READY</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 w-1/2 rounded-full" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
              Complete staged challenges to level up your engineering radar and earn credentials.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
