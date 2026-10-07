'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMissionEngine } from '@/hooks/useMissionEngine';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Compass,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Unlock,
  Lock,
  DoorOpen,
  ArrowRight,
  RefreshCw,
  Terminal,
  Send,
  Eye,
  Key,
  ShieldAlert,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function MissionPlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    missionState,
    isLoading,
    isInteracting,
    lastResult,
    recentEvents,
    error,
    interact,
    requestHint,
    refreshState,
  } = useMissionEngine(slug);

  // Local interaction input state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [activeHintTab, setActiveHintTab] = useState<boolean>(false);

  if (isLoading || !missionState) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            Initializing authoritative mission gameplay engine...
          </p>
        </div>
      </div>
    );
  }

  const {
    title,
    currentStage,
    totalStages,
    completedStages,
    score,
    xp,
    attempts,
    hintsUsed,
    status,
    activeStage,
    availableInteractions,
    availableQuestions,
    availableHints,
    unlockedObjects,
    revealedClues,
    sceneObjects,
    isExitUnlocked,
  } = missionState;

  const currentQuestion = availableQuestions[0];
  const questionInteraction = availableInteractions.find(
    (i) => i.questionId === currentQuestion?.id
  );

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInteraction) return;

    const answer =
      currentQuestion?.type === 'multiple_choice' ? selectedOption : customInput;
    if (!answer) return;

    await interact(questionInteraction.id, { answer, code: answer });
    setSelectedOption('');
    setCustomInput('');
  };

  const handleInspectObject = async (interactionId: string) => {
    await interact(interactionId);
  };

  const handleUseHint = async (hintId: string) => {
    await requestHint(hintId);
  };

  const progressPercentage = Math.round((completedStages.length / totalStages) * 100);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* HUD Telemetry Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              MISSION ENGINE // ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Version {missionState.missionVersion}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h1>
        </div>

        {/* HUD Counters */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">SCORE</span>
              <span className="text-sm font-bold text-white">{score}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-electric-blue" />
            <div>
              <span className="text-slate-400 block text-[10px]">ATTEMPTS</span>
              <span className="text-sm font-bold text-white">{attempts}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">HINTS</span>
              <span className="text-sm font-bold text-white">{hintsUsed}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">COMPLETED</span>
              <span className="text-sm font-bold text-white">
                {completedStages.length}/{totalStages}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Progression Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">
            STAGE {currentStage} OF {totalStages}:{' '}
            <strong className="text-white">{activeStage?.title || 'Mission Finalized'}</strong>
          </span>
          <span className="text-cyan-400 font-bold">{progressPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stage Objective & Briefing Card */}
      {activeStage && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>Active Stage Objective</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {activeStage.objective}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeStage.description}
              </p>
            </div>

            {/* Hint Trigger */}
            {availableHints.length > 0 && (
              <button
                onClick={() => setActiveHintTab(!activeHintTab)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-2 transition-colors whitespace-nowrap"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{activeHintTab ? 'Hide Hints' : 'View Hints'}</span>
              </button>
            )}
          </div>

          {/* Expandable Hints Drawer */}
          {activeHintTab && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                Stage Diagnostic Hints
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableHints.map((hint) => (
                  <div
                    key={hint.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-400 font-bold">
                        Hint #{hint.order}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        -{hint.penalty} Score Penalty
                      </span>
                    </div>
                    {hint.isUsed ? (
                      <p className="text-slate-200 italic font-sans">{hint.text}</p>
                    ) : (
                      <button
                        onClick={() => handleUseHint(hint.id)}
                        disabled={isInteracting}
                        className="w-full py-2 rounded-lg font-mono text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors disabled:opacity-50"
                      >
                        Unlock Hint (-{hint.penalty} Score)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Gameplay Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Question Card & Object Inspection Console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question / Diagnostic Challenge Card */}
          {currentQuestion && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4" />
                  <span>Technical Diagnostic Challenge</span>
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  +{currentQuestion.points} Points
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.prompt}
              </h3>

              {/* Form Input */}
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((option, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start space-x-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                          selectedOption === option
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-glow-cyan'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="question_option"
                          value={option}
                          checked={selectedOption === option}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="mt-0.5 text-cyan-400 focus:ring-0"
                        />
                        <span className="leading-relaxed">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder={
                        currentQuestion.type === 'code'
                          ? 'Enter 4-digit breaker clearance code...'
                          : 'Enter diagnostic value...'
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isInteracting ||
                    (currentQuestion.type === 'multiple_choice' && !selectedOption) ||
                    (currentQuestion.type !== 'multiple_choice' && !customInput)
                  }
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 flex items-center justify-center space-x-2 transition-all shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isInteracting ? 'Validating on Server...' : 'Submit Answer'}</span>
                </button>
              </form>

              {/* Feedback Message */}
              {lastResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
                    lastResult.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : lastResult.isCorrect === false
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                  }`}
                >
                  {lastResult.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : lastResult.isCorrect === false ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-bold">
                      {lastResult.isCorrect
                        ? 'Diagnostic Verified'
                        : lastResult.isCorrect === false
                        ? 'Validation Mismatch'
                        : 'Telemetry Inspected'}
                    </strong>
                    <span>{lastResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Object Workbench / 3D Emulation Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Scene Object Diagnostics (Authoritative Hardware Bus)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Phase 2 Data-Driven Bus
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Click an accessible scene object to trigger an inspection event. In Phase 3, this
              bus is directly triggered by raycast clicks in the React Three Fiber 3D room.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {availableInteractions
                .filter((i) => !i.questionId)
                .map((interaction) => {
                  const targetObj = sceneObjects.find((o) => o.id === interaction.targetObjectId);
                  const isLocked = !unlockedObjects.includes(interaction.targetObjectId);

                  return (
                    <div
                      key={interaction.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>{targetObj?.name || interaction.targetObjectId}</span>
                          </span>
                          <span className="text-[10px] font-mono uppercase text-slate-500">
                            {interaction.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {interaction.description || interaction.title}
                        </p>
                      </div>

                      <button
                        onClick={() => handleInspectObject(interaction.id)}
                        disabled={isLocked || isInteracting}
                        className={`w-full py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                          isLocked
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                            : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isLocked ? 'Object Locked' : 'Inspect Telemetry'}</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Unlocked Clues, Exit Portal & Mission Complete */}
        <div className="space-y-6">
          {/* Exit Portal Status */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              isExitUnlocked
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                : 'glass-panel border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <DoorOpen
                className={`w-6 h-6 ${isExitUnlocked ? 'text-emerald-400' : 'text-slate-500'}`}
              />
              <div>
                <h4 className="text-sm font-bold text-white font-mono uppercase">
                  Datacenter Exit Portal
                </h4>
                <span
                  className={`text-[10px] font-mono font-bold uppercase ${
                    isExitUnlocked ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isExitUnlocked ? 'UNLOCKED // ESCAPE READY' : 'LOCKED // HIGH THERMAL ALARM'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isExitUnlocked
                ? 'Cooling restored! The hermetic datacenter safety door has unlocked. You have successfully prevented thermal meltdown.'
                : 'Complete all 4 diagnostic stages to restore server cooling and unlock the exit door.'}
            </p>

            {status === 'COMPLETED' && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20 text-center">
                <Link
                  href="/dashboard"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center space-x-2 transition-all shadow-glow-cyan"
                >
                  <span>Return to Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Revealed Clues Drawer */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Revealed Mission Clues</span>
            </h4>

            {revealedClues.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">
                No clues discovered yet. Complete diagnostic stages to unlock authorization keys.
              </p>
            ) : (
              <div className="space-y-2.5">
                {revealedClues.map((clue, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-200 font-mono space-y-1"
                  >
                    <span className="text-[10px] text-slate-500 block">CLUE #{idx + 1}</span>
                    <p className="font-bold">{clue.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-Time Event Bus Feed */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-electric-blue" />
              <span>Live Engine Event Stream</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <p className="text-[11px] font-mono text-slate-500">
                  Listening for hardware interaction events...
                </p>
              ) : (
                recentEvents.slice(0, 6).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[10px] font-mono flex items-center justify-between"
                  >
                    <span className="text-cyan-400 font-bold">{evt.type}</span>
                    <span className="text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
