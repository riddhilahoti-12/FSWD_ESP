'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Lock, MousePointerClick } from 'lucide-react';

interface InteractionPromptProps {
  objectId: string | null;
  objectName: string | null;
  isLocked: boolean;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({
  objectId,
  objectName,
  isLocked,
}) => {
  return (
    <AnimatePresence>
      {objectId && objectName && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-30"
        >
          <div
            className={`flex items-center gap-3 px-5 py-2.5 rounded-lg border backdrop-blur-md shadow-2xl font-mono text-xs tracking-wide ${
              isLocked
                ? 'bg-red-950/80 border-red-500/50 text-red-200'
                : 'bg-slate-950/85 border-cyan-500/60 text-cyan-200'
            }`}
          >
            {isLocked ? (
              <Lock className="w-4 h-4 text-red-400 animate-pulse" />
            ) : (
              <Eye className="w-4 h-4 text-cyan-400" />
            )}

            <div className="flex flex-col">
              <span className="font-bold uppercase tracking-wider text-[11px] text-white">
                {objectName}
              </span>
              <span className="text-[10px] opacity-75">
                {isLocked ? 'SECURITY LOCKDOWN • COMPLETE PRIOR STAGE' : 'CLICK TO INSPECT TELEMETRY'}
              </span>
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                isLocked ? 'bg-red-900/60 text-red-300' : 'bg-cyan-900/60 text-cyan-300'
              }`}
            >
              <MousePointerClick className="w-3 h-3" />
              <span>{isLocked ? 'LOCKED' : 'INTERACT'}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
