import React from 'react';
import Link from 'next/link';
import { Mission, Progress } from '@missionx/shared';
import { Clock, ShieldAlert, Cpu, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  progress?: Progress | null;
}

export default function MissionCard({ mission, progress }: MissionCardProps) {
  const isCompleted = progress?.status === 'COMPLETED';
  const isInProgress = progress?.status === 'IN_PROGRESS';

  const difficultyColors = {
    Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between h-full group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono font-medium text-slate-400 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mission.domain}</span>
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
              difficultyColors[mission.difficulty] || difficultyColors.Medium
            }`}
          >
            {mission.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
          {mission.title}
        </h3>

        {/* Estimated Duration */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mb-4">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{mission.estimatedDuration}</span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          {mission.description}
        </p>
      </div>

      <div>
        {/* Progress Status Bar (if started) */}
        {progress && (
          <div className="mb-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-mono">Stage {progress.currentStage}</span>
              <span
                className={`font-mono font-bold text-[11px] ${
                  isCompleted
                    ? 'text-emerald-400'
                    : isInProgress
                    ? 'text-cyan-400'
                    : 'text-slate-500'
                }`}
              >
                {progress.status.replace('_', ' ')}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
                style={{
                  width: isCompleted
                    ? '100%'
                    : `${Math.min(100, (progress.currentStage / 4) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link
          href={`/missions/${mission.slug}`}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
            isInProgress
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-glow-cyan'
              : isCompleted
              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/50'
          }`}
        >
          {isInProgress ? (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>CONTINUE MISSION</span>
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>REVIEW MISSION</span>
            </>
          ) : (
            <>
              <span>START MISSION</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
