'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, MonitorX, LayoutDashboard, ArrowLeft } from 'lucide-react';

interface WebGLFallbackProps {
  onRetry?: () => void;
  error?: string;
}

export default function WebGLFallback({ onRetry, error }: WebGLFallbackProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#060911]">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-rose-500/30 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <MonitorX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            WebGL 3D Mode Unavailable
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            MissionX requires hardware-accelerated WebGL 2.0 to render the virtual server room.
            Your current browser or display driver has WebGL disabled or unavailable.
          </p>
          {error && (
            <p className="text-[11px] font-mono text-rose-400/90 bg-rose-500/10 p-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors"
            >
              Retry WebGL
            </button>
          )}
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 rounded-xl font-mono text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
