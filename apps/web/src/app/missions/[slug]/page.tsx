'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import {
  Clock,
  Cpu,
  Target,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowLeft,
  Server,
  Terminal,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function MissionDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [startError, setStartError] = useState<string | null>(null);

  const {
    data: mission,
    isLoading: missionLoading,
    error: missionError,
  } = useQuery({
    queryKey: ['mission', slug],
    queryFn: () => api.missions.getBySlug(slug),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', mission?._id],
    queryFn: () => api.progress.getByMission(mission!._id),
    enabled: !!user && !!mission?._id,
  });

  const startMutation = useMutation({
    mutationFn: (missionId: string) => api.missions.start(missionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progress', mission?._id] });
      queryClient.invalidateQueries({ queryKey: ['my-progress'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push(`/missions/${slug}/play`);
    },
    onError: (err: any) => {
      setStartError(err.message || 'Failed to initialize mission session');
    },
  });

  const handleEnterMission = () => {
    setStartError(null);
    if (!user) {
      router.push('/login');
      return;
    }
    if (mission) {
      startMutation.mutate(mission._id);
    }
  };

  if (missionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading mission dossier...</p>
        </div>
      </div>
    );
  }

  if (missionError || !mission) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/30">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Mission Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">
            The mission briefing you requested could not be retrieved from the central catalog.
          </p>
          <Link
            href="/missions"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Mission Library</span>
          </Link>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Back Link */}
      <Link
        href="/missions"
        className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO MISSION LIBRARY</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Briefing Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-mono text-cyan-400 flex items-center space-x-1.5 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                <Cpu className="w-3.5 h-3.5" />
                <span>{mission.domain}</span>
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  difficultyColors[mission.difficulty] || difficultyColors.Medium
                }`}
              >
                {mission.difficulty}
              </span>

              <span className="text-xs font-mono text-slate-400 flex items-center space-x-1 ml-auto">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{mission.estimatedDuration}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
              {mission.title}
            </h1>

            {/* Briefing Quote */}
            <div className="p-4 rounded-xl bg-cyan-500/5 border-l-4 border-cyan-400 text-cyan-200 text-sm italic font-sans leading-relaxed mb-6">
              &ldquo;{mission.briefing}&rdquo;
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                Operational Overview
              </h3>
              <p>{mission.description}</p>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center space-x-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Target Learning Objectives</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {mission.learningObjectives.map((obj, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Escape Room Notice */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start space-x-3.5 text-xs text-indigo-200 leading-relaxed">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-1">
                3D Interactive Environment Notice:
              </span>
              You will enter an interactive virtual environment where you must inspect equipment,
              analyze sensor data, and solve technical challenges.
            </div>
          </div>
        </div>

        {/* Action / Launch Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-glow-cyan space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Mission Launch Terminal</span>
            </h3>

            {/* Current Status if Logged In */}
            {user ? (
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Student:</span>
                  <span className="font-mono text-white font-bold">{user.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Status:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {progress?.status ? progress.status.replace('_', ' ') : 'NOT STARTED'}
                  </span>
                </div>
                {progress && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Current Stage:</span>
                    <span className="font-mono text-white">Stage {progress.currentStage} / 4</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                Please log in with your student profile to record mission progress and earn XP.
              </div>
            )}

            {startError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {startError}
              </div>
            )}

            <button
              onClick={handleEnterMission}
              disabled={startMutation.isPending}
              className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 flex items-center justify-center space-x-2.5 transition-all shadow-glow-cyan transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {startMutation.isPending
                  ? 'Initializing Session...'
                  : progress?.status === 'IN_PROGRESS'
                  ? 'CONTINUE MISSION'
                  : 'ENTER MISSION'}
              </span>
            </button>
          </div>

          {/* Quick Hardware Spec Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulated Hardware Stack</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
              {mission.slug === 'signal-in-the-lab' ? (
                <>
                  <li>• 200 MHz Digital Storage Oscilloscope</li>
                  <li>• Arbitrary Function Synthesizer</li>
                  <li>• Active Op-Amp Filter Bank</li>
                  <li>• ATE Instrumentation Console</li>
                </>
              ) : mission.slug === 'lost-sensor-network' ? (
                <>
                  <li>• Multi-Node ESP32 IoT Cluster</li>
                  <li>• 24-Port Managed Gigabit Switch</li>
                  <li>• Enterprise Core Edge Router</li>
                  <li>• Industrial WiFi 6 Access Point</li>
                </>
              ) : mission.slug === 'power-grid-calibration' ? (
                <>
                  <li>• 12-Bit Analog Quantizer (MCP3208)</li>
                  <li>• 1 kHz Synchronous PWM Driver</li>
                  <li>• 10 Ω Non-Inductive Load Bank</li>
                  <li>• Digital Precision Voltmeter</li>
                </>
              ) : mission.slug === 'smart-greenhouse-mystery' ? (
                <>
                  <li>• Multi-Spectral Agricultural IoT Node</li>
                  <li>• Precision Drip Irrigation Solenoids</li>
                  <li>• Convective Gable Exhaust Blower</li>
                  <li>• Full-Spectrum Horticulture Grow Lights</li>
                </>
              ) : (
                <>
                  <li>• ESP32 DevKit Core</li>
                  <li>• DHT22 Ambient Temperature/Humidity</li>
                  <li>• Emergency Relay Actuator</li>
                  <li>• Diagnostic Strobe Warning Beacon</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
