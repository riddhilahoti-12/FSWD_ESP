'use client';

import React, { useEffect, useState } from 'react';

interface CustomCursorProps {
  isLockedCursor?: boolean; // pointer lock mode
  isHoveringInteractive?: boolean;
  isHoveringLocked?: boolean;
  hoverLabel?: string;
}

export default function CustomCursor({
  isLockedCursor = false,
  isHoveringInteractive = false,
  isHoveringLocked = false,
  hoverLabel,
}: CustomCursorProps) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (isLockedCursor) return; // In pointer lock, cursor stays centered

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isLockedCursor]);

  // Center crosshair in pointer-lock mode, otherwise follow mouse
  const style: React.CSSProperties = isLockedCursor
    ? {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
      }
    : {
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
      };

  return (
    <div style={style} className="flex flex-col items-center">
      {/* Reticle / Double Circle */}
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div
          className={`rounded-full border transition-all duration-150 ${
            isHoveringLocked
              ? 'w-8 h-8 border-rose-500/80 bg-rose-500/10'
              : isHoveringInteractive
              ? 'w-9 h-9 border-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
              : isClicking
              ? 'w-5 h-5 border-cyan-300'
              : 'w-6 h-6 border-cyan-500/40'
          }`}
        />

        {/* Inner Dot */}
        <div
          className={`absolute rounded-full transition-all duration-150 ${
            isHoveringLocked
              ? 'w-1.5 h-1.5 bg-rose-400'
              : isHoveringInteractive
              ? 'w-2 h-2 bg-cyan-300'
              : isClicking
              ? 'w-2 h-2 bg-white'
              : 'w-1 h-1 bg-cyan-400'
          }`}
        />

        {/* Pointer Lock Center Crosshair Ticks */}
        {isLockedCursor && !isHoveringInteractive && (
          <>
            <div className="absolute w-2 h-[1px] bg-cyan-400/40 -left-3" />
            <div className="absolute w-2 h-[1px] bg-cyan-400/40 -right-3" />
            <div className="absolute h-2 w-[1px] bg-cyan-400/40 -top-3" />
            <div className="absolute h-2 w-[1px] bg-cyan-400/40 -bottom-3" />
          </>
        )}
      </div>

      {/* Floating Prompt Label when hovering */}
      {hoverLabel && (
        <div className="mt-4 px-2.5 py-1 rounded bg-slate-950/90 border border-cyan-500/50 text-[10px] font-mono font-bold tracking-wider text-cyan-300 whitespace-nowrap shadow-lg flex items-center space-x-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isHoveringLocked ? 'bg-rose-400' : 'bg-cyan-400 animate-ping'
            }`}
          />
          <span>{hoverLabel}</span>
        </div>
      )}
    </div>
  );
}
