'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Zap,
  Volume2,
  VolumeX,
  HelpCircle,
  Bell,
  FileText,
  Key,
  Shield,
  Layers,
  ChevronDown,
  Terminal,
  Cpu,
  MapPin,
  Map as MapIcon,
} from 'lucide-react';
import { soundEffects } from '../Sound/soundEffects';

interface MissionHUDProps {
  title: string;
  currentStage: number;
  totalStages: number;
  stageTitle: string;
  stageObjective: string;
  stageLocation?: string;
  score: number;
  xp: number;
  cluesCount: number;
  connectionStatus?: string;
  onToggleObjectives: () => void;
  onToggleClues: () => void;
  onToggleDebug: () => void;
  showDebug: boolean;
  onPressBuzzer?: () => void;
  onToggleMap?: () => void;
  isMission1?: boolean;
  isArrowControls?: boolean;
  controlLabel?: string;
}

export const MissionHUD: React.FC<MissionHUDProps> = ({
  title,
  currentStage,
  totalStages,
  stageTitle,
  stageObjective,
  stageLocation,
  score,
  xp,
  cluesCount,
  connectionStatus = 'SIMULATED',
  onToggleObjectives,
  onToggleClues,
  onToggleDebug,
  showDebug,
  onPressBuzzer,
  onToggleMap,
  isMission1 = false,
  isArrowControls = false,
  controlLabel = 'Explore',
}) => {
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted());
  const [showControlsHint, setShowControlsHint] = useState(true);

  const handleToggleSound = () => {
    const nextMuted = soundEffects.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <>
      {/* Top Header Glassmorphic HUD Bar */}
      <header className="fixed top-0 left-0 right-0 z-20 pointer-events-none p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Mission Identity & Stage Badge */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-lg">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-xs font-medium text-cyan-300">
                STAGE {currentStage} / {totalStages}
              </span>
            </div>
          </div>

          {/* Quick Objective Card Pill with Location */}
          <div className="hidden md:flex flex-col gap-0.5 px-4 py-1.5 rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-lg pointer-events-auto max-w-lg">
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                CURRENT OBJECTIVE
              </span>
              {stageLocation && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300 ml-auto">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {stageLocation}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-200 truncate font-medium">
              <strong className="text-white font-semibold mr-1.5">{stageTitle}:</strong>
              {stageObjective}
            </span>
          </div>

          {/* Score, XP & Interactive Toolbar */}
          <div className="flex items-center gap-2.5 pointer-events-auto">
            {/* Score & XP Counter */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-lg font-mono text-xs">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="text-[10px] text-slate-400">SCORE</span>
                <span className="font-bold">{score}</span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-purple-400">
                <Zap className="w-3 h-3" />
                <span className="font-bold">{xp} XP</span>
              </div>
            </div>

            {/* Mission Map Toggle Button (Part 18 & Part 11) */}
            {onToggleMap && (
              <button
                onClick={onToggleMap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/60 text-cyan-200 hover:text-white text-xs font-medium transition backdrop-blur-md shadow-md shadow-cyan-500/20"
                title="Open Mission Map (M)"
                id="hud-mission-map-btn"
              >
                <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono font-bold tracking-wider">MAP</span>
              </button>
            )}

            {/* Objective Drawer Toggle */}
            <button
              onClick={onToggleObjectives}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-cyan-300 text-xs font-medium transition backdrop-blur-md"
              title="View Objectives"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Tasks</span>
            </button>

            {/* Clues Drawer Toggle */}
            <button
              onClick={onToggleClues}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-amber-300 text-xs font-medium transition backdrop-blur-md"
              title="View Clues"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Clues</span>
              {cluesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Hint Buzzer Button */}
            {onPressBuzzer && (
              <button
                onClick={onPressBuzzer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/60 text-amber-300 hover:text-amber-100 text-xs font-medium transition backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:shadow-[0_0_18px_rgba(245,158,11,0.4)] cursor-pointer group"
                title="Press Stage Hint Buzzer (-10 pts)"
                id="hud-hint-buzzer-btn"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform animate-bounce" />
                <span className="font-mono font-semibold tracking-wider">HINT</span>
              </button>
            )}

            {/* IoT Realtime Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'ONLINE'
                    ? 'bg-emerald-400'
                    : connectionStatus === 'SIMULATED'
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-400">IoT:</span>
              <span className="text-slate-200 font-bold">{connectionStatus}</span>
            </div>

            {/* IoT Simulator Workbench Link */}
            <Link
              href="/simulator"
              target="_blank"
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition backdrop-blur-md"
              title="Open Technical IoT Telemetry Simulator"
            >
              <Cpu className="w-4 h-4" />
            </Link>

            {/* Global Sound Mute */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition backdrop-blur-md"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Dev Debug Toggle */}
            {process.env.NODE_ENV !== 'production' && (
              <button
                onClick={onToggleDebug}
                className={`p-1.5 rounded-lg border transition backdrop-blur-md ${
                  showDebug
                    ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Development Engine Debugger"
              >
                <Terminal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Controls Reminder Hint - Subtle & Non-intrusive (Part 2) */}
      {showControlsHint && (
        <aside aria-label="Controls Guide" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl font-mono text-[11px] text-slate-300">
            {isMission1 || isArrowControls ? (
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <span className="text-base tracking-widest font-mono">↑ ↓ ← →</span>
                <span className="text-slate-300 font-medium ml-1">{controlLabel}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">W</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">A</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">S</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">D</kbd>
                <span className="text-slate-400">Move</span>
              </span>
            )}

            <span className="w-px h-3 bg-slate-700" />
            <span className="flex items-center gap-1 text-slate-400">
              <span className="text-cyan-300 font-medium">Click</span> Interact
            </span>

            {onToggleMap && (
              <>
                <span className="w-px h-3 bg-slate-700" />
                <span className="flex items-center gap-1 text-slate-400">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">M</kbd>
                  <span>Map</span>
                </span>
              </>
            )}

            <button
              onClick={() => setShowControlsHint(false)}
              className="text-slate-500 hover:text-slate-300 ml-1"
              title="Dismiss hint"
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
