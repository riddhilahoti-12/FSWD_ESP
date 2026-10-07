'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  LogIn,
  Cpu,
  Layers,
  Terminal,
  Activity,
  ArrowRight,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const pillars = [
    {
      icon: Layers,
      title: 'Experiential Learning',
      description:
        'Move beyond passive lectures into high-stakes engineering scenarios where theoretical concepts directly govern real-time physical systems.',
      color: 'text-cyan-400',
      border: 'hover:border-cyan-500/40',
    },
    {
      icon: Cpu,
      title: 'IoT Simulation',
      description:
        'Interact with virtual microcontrollers, live sensor telemetry (DHT22, thermistors, water levels), and actuator relays replicating real hardware benches.',
      color: 'text-electric-blue',
      border: 'hover:border-blue-500/40',
    },
    {
      icon: Terminal,
      title: '3D Interactive Missions',
      description:
        'Explore spatially rendered technical facilities—from campus datacenters to network nodes—inspecting equipment and diagnosing critical alarms.',
      color: 'text-electric-violet',
      border: 'hover:border-violet-500/40',
    },
    {
      icon: Activity,
      title: 'Technical Problem Solving',
      description:
        'Solve staged engineering puzzles, interpret telemetry anomalies, deduce actuator failure modes, and restore mission-critical uptime.',
      color: 'text-emerald-400',
      border: 'hover:border-emerald-500/40',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MISSIONX PLATFORM // PHASE 1 ACTIVE</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            IoT-Enabled 3D <br />
            <span className="gradient-text-cyan">Escape Room Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-10 font-normal">
            Step into immersive virtual engineering facilities where telemetry is live,
            hardware is simulated, and every challenge tests your diagnostic technical mastery.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/missions"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Missions</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:border-cyan-500/50"
            >
              <LogIn className="w-5 h-5 text-cyan-400" />
              <span>Login to Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured First Mission Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  FEATURED MISSION
                </span>
                <span className="text-xs font-mono text-slate-400">IoT / EMBEDDED SYSTEMS</span>
              </div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Server className="w-6 h-6 text-cyan-400" />
                <span>Rescue the Server Room</span>
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                "The server room is overheating. Determine whether the cooling system is functioning correctly."
                Analyze live temperature and humidity telemetry to prevent hardware meltdown.
              </p>
            </div>

            <Link
              href="/missions/rescue-the-server-room"
              className="px-6 py-3 rounded-xl text-sm font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/25 transition-all flex items-center space-x-2 whitespace-nowrap"
            >
              <span>View Briefing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Core Learning Architecture
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Engineered to replace abstract textbooks with hands-on, high-consequence technical investigations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`glass-panel p-6 rounded-2xl border transition-all ${pillar.border} flex flex-col justify-between`}
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-5">
                    <Icon className={`w-5 h-5 ${pillar.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
