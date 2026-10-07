'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Server,
  Activity,
  Cpu,
  CheckCircle2,
  Clock,
  ArrowLeft,
  LayoutDashboard,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function MissionPlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();

  const { data: mission } = useQuery({
    queryKey: ['mission', slug],
    queryFn: () => api.missions.getBySlug(slug),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', mission?._id],
    queryFn: () => api.progress.getByMission(mission!._id),
    enabled: !!mission?._id && !!user,
  });

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center items-center text-center">
      {/* Container */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 shadow-glow-cyan max-w-2xl w-full">
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>SESSION ACTIVE // IN_PROGRESS</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
          {mission ? mission.title : 'Mission Staging Area'}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed mb-8">
          Student Progress record has been registered in the database for{' '}
          <span className="text-cyan-400 font-bold font-mono">
            {user?.name || 'Authorized Cadet'}
          </span>
          .
        </p>

        {/* Phase 1 Staging Information Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-4 mb-8">
          <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-3">
            <span className="text-slate-400">Current Stage:</span>
            <span className="text-cyan-400 font-bold">
              Stage {progress?.currentStage ?? 1} (Diagnostics)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-3">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold">
              {progress?.status ?? 'IN_PROGRESS'}
            </span>
          </div>

          <div className="flex items-start space-x-3 pt-1">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Phase 1 Foundation Milestone:</strong>{' '}
              The full-stack data pipeline, MongoDB models, student authentication, and session state
              are fully active. The interactive 3D virtual room and Wokwi simulation will connect in upcoming phases.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center space-x-2 transition-all shadow-glow-cyan"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Student Dashboard</span>
          </Link>

          <Link
            href={`/missions/${slug}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Review Briefing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
