'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  AlertTriangle,
  Key,
  X,
  Compass,
} from 'lucide-react';
import { MissionState, UsedHintRecord } from '@missionx/shared';
import { soundEffects } from '../Sound/soundEffects';

interface ObjectiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  missionState: MissionState;
  onRequestHint: (hintId: string) => void;
}

export const ObjectiveDrawer: React.FC<ObjectiveDrawerProps> = ({
  isOpen,
  onClose,
  missionState,
  onRequestHint,
}) => {
  const {
    activeStage,
    totalStages,
    availableInteractions,
    availableQuestions,
    availableHints,
    usedHints,
    revealedClues,
  } = missionState;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950/95 border-l border-slate-800/80 shadow-2xl z-50 p-6 flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Mission Directives
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Stage & Objective */}
            <div className="py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  STAGE {activeStage?.order || 1} OF {totalStages}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                  IN PROGRESS
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {activeStage?.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeStage?.objective}
                </p>
              </div>

              {/* Task Checklist (Driven Authoritatively by Mission Engine) */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  Operational Checklist
                </h4>

                <div className="space-y-2">
                  {availableInteractions.map((interaction) => {
                    const isQuestion = Boolean(interaction.questionId);
                    return (
                      <div
                        key={interaction.id}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs"
                      >
                        <Circle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-slate-200">
                            {interaction.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Target: <span className="font-mono text-cyan-300">{interaction.targetObjectId}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Hints with penalty */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  Technical Intelligence & Hints
                </h4>

                {/* Used Hints */}
                {usedHints.length > 0 && (
                  <div className="space-y-2">
                    {usedHints.map((h, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed"
                      >
                        <div className="font-bold text-[10px] uppercase text-amber-400 mb-1">
                          Hint {i + 1} (Penalty applied: -{h.penalty} pts)
                        </div>
                        {h.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Unused Available Hints */}
                {availableHints.length > 0 && (
                  <div className="space-y-2">
                    {availableHints.map((hint) => (
                      <button
                        key={hint.id}
                        onClick={() => {
                          soundEffects.playClick();
                          onRequestHint(hint.id);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-600/50 text-left transition text-xs group"
                      >
                        <span className="text-slate-300 group-hover:text-amber-200">
                          Request Diagnostic Hint
                        </span>
                        <span className="font-mono text-[10px] text-amber-400">
                          -{hint.penalty} PTS
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Revealed Mission Clues */}
              {revealedClues.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4" />
                    Decoded Security Clues
                  </h4>
                  <div className="space-y-2">
                    {revealedClues.map((clue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs font-mono text-emerald-300"
                      >
                        ✓ {clue.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
