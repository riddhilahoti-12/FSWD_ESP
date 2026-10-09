'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Send,
  X,
  AlertCircle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { ClientQuestion } from '@missionx/shared';
import { soundEffects } from '../Sound/soundEffects';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ClientQuestion | null;
  interactionId: string;
  isSubmitting?: boolean;
  onSubmit: (interactionId: string, answer: string) => Promise<boolean>;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  interactionId,
  isSubmitting = false,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!question) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const answer =
      question.type === 'multiple_choice' ? selectedOption : textInput.trim();

    if (!answer) {
      setValidationError('Please select or provide an engineering answer.');
      return;
    }

    soundEffects.playClick();
    const success = await onSubmit(interactionId, answer);
    if (success) {
      soundEffects.playUnlock();
      onClose();
    } else {
      soundEffects.playAlert();
      setValidationError('Incorrect engineering solution. Re-inspect telemetry or verify calculations.');
    }
  };

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
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Engineering Challenge
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400">
                    <Zap className="w-3 h-3" />
                    <span>+{question.points} XP Available</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-100 leading-relaxed">
                {question.prompt}
              </div>

              {/* Multiple Choice Options */}
              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-2.5">
                  {question.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(option)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-mono transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-100 shadow-md shadow-cyan-950/50'
                            : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                            isSelected
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Code / String Input */}
              {question.type !== 'multiple_choice' && (
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                    Clearance / Authorization Input
                  </label>
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter code (e.g. 4180)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 font-mono text-sm text-cyan-300 focus:outline-none transition"
                  />
                </div>
              )}

              {/* Validation Warning */}
              {validationError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                <button
                  id="submit-question-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
                >
                  <span>{isSubmitting ? 'Evaluating...' : 'Transmit Solution'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
