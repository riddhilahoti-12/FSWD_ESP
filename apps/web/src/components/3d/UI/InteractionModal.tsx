'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  X,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { soundEffects } from '../Sound/soundEffects';

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  objectId: string;
  isLocked: boolean;
  feedbackMessage?: string | null;
  config?: any;
  isLoading?: boolean;
  onConfirm: () => void;
  confirmLabel?: string;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  isOpen,
  onClose,
  title,
  objectId,
  isLocked,
  feedbackMessage,
  config,
  isLoading = false,
  onConfirm,
  confirmLabel = 'Execute Telemetry Query',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 font-sans"
          >
            {/* Top Accent Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isLocked
                  ? 'bg-red-950/40 border-red-900/50'
                  : 'bg-cyan-950/30 border-cyan-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isLocked ? (
                  <Lock className="w-5 h-5 text-red-400" />
                ) : (
                  <Activity className="w-5 h-5 text-cyan-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {title}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    ID: {objectId}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              {isLocked ? (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-200 leading-relaxed">
                    <p className="font-bold text-red-300 mb-1">ACCESS RESTRICTED</p>
                    This hardware unit is currently locked by datacenter protocol.
                    You must complete the prior investigation stages to acquire clearance.
                  </div>
                </div>
              ) : (
                <>
                  {/* Telemetry Reading Grid if available */}
                  {config && Object.keys(config).length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(config).map(([key, val]) => (
                        <div
                          key={key}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono"
                        >
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                            {key}
                          </div>
                          <div className="text-sm font-bold text-cyan-300">
                            {String(val)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Feedback Message */}
                  {feedbackMessage ? (
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 font-mono text-xs text-slate-200 leading-relaxed">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1.5 uppercase text-[10px]">
                        <Terminal className="w-3.5 h-3.5" />
                        Authoritative Engine Diagnostic
                      </div>
                      {feedbackMessage}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Initiate hardware inspection query to sample real-time bus
                      telemetry and advance the mission state.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                id="close-interaction-btn"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Close
              </button>

              {!isLocked && (
                <button
                  id="confirm-interaction-btn"
                  disabled={isLoading}
                  onClick={() => {
                    soundEffects.playClick();
                    onConfirm();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
                >
                  <span>{isLoading ? 'Querying...' : confirmLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
