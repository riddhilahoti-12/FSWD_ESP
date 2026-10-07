'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Unlock, CheckCircle, DoorOpen } from 'lucide-react';
import { MissionEvent } from '@missionx/shared';
import { soundEffects } from '../Sound/soundEffects';

interface StageNotificationProps {
  events: MissionEvent[];
}

export const StageNotification: React.FC<StageNotificationProps> = ({ events }) => {
  const [activeBanner, setActiveBanner] = useState<{
    id: string;
    title: string;
    message: string;
    icon: 'completion' | 'unlock' | 'door';
  } | null>(null);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const latest = events[0];
    if (latest.type === 'STAGE_COMPLETED' || latest.type === 'MISSION_COMPLETED') {
      soundEffects.playCompletion();
      setActiveBanner({
        id: Math.random().toString(),
        title: latest.type === 'MISSION_COMPLETED' ? 'MISSION ACCOMPLISHED!' : 'STAGE COMPLETE!',
        message: latest.payload?.title || 'Operational criteria satisfied.',
        icon: 'completion',
      });
    } else if (latest.type === 'DOOR_UNLOCKED') {
      soundEffects.playUnlock();
      setActiveBanner({
        id: Math.random().toString(),
        title: 'HERMETIC EXIT PORTAL UNLOCKED',
        message: 'Security lockdown disabled. Proceed to exit door.',
        icon: 'door',
      });
    } else if (latest.type === 'OBJECT_UNLOCKED') {
      soundEffects.playUnlock();
      setActiveBanner({
        id: Math.random().toString(),
        title: 'HARDWARE UNLOCKED',
        message: `Clearance granted for ${latest.payload?.objectId || 'equipment'}.`,
        icon: 'unlock',
      });
    }

    const timer = setTimeout(() => {
      setActiveBanner(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [events]);

  return (
    <AnimatePresence>
      {activeBanner && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/50 shadow-2xl backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800 shrink-0">
              {activeBanner.icon === 'door' ? (
                <DoorOpen className="w-5 h-5" />
              ) : activeBanner.icon === 'unlock' ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Trophy className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div>
              <div className="font-mono font-bold text-xs uppercase tracking-wider text-white">
                {activeBanner.title}
              </div>
              <div className="text-xs text-cyan-200 mt-0.5">
                {activeBanner.message}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
