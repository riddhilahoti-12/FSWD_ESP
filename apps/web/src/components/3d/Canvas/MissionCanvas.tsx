'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MissionState } from '@missionx/shared';
import { MissionRoom } from '../Room/MissionRoom';
import { FirstPersonController } from '../Camera/FirstPersonController';
import WebGLFallback from './WebGLFallback';

interface MissionCanvasProps {
  missionState: MissionState;
  isInputPaused?: boolean;
  onObjectClick: (objectId: string) => void;
  onObjectHover: (objectId: string | null, name: string | null, isLocked: boolean) => void;
}

export const MissionCanvas: React.FC<MissionCanvasProps> = ({
  missionState,
  isInputPaused = false,
  onObjectClick,
  onObjectHover,
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return (
      <WebGLFallback
        onRetry={() => {
          setHasWebGL(null);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div
      id="canvas-container"
      className="relative w-full h-full select-none cursor-crosshair overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 1.65, 3.5], fov: 65, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <MissionRoom
            missionState={missionState}
            onObjectClick={onObjectClick}
            onObjectHover={onObjectHover}
          />
          <FirstPersonController isInputPaused={isInputPaused} />
        </Suspense>
      </Canvas>
    </div>
  );
};
