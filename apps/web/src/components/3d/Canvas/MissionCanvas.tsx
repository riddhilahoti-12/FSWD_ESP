'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MissionState } from '@missionx/shared';
import { MissionRoom } from '../Room/MissionRoom';
import { FirstPersonController } from '../Camera/FirstPersonController';
import { ThirdPersonController } from '../Camera/ThirdPersonController';
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

  const slug = (missionState.slug || '').toLowerCase();
  const isMission1 = slug === 'rescue-the-server-room';
  const isMission2 = slug === 'signal-in-the-lab';

  return (
    <div
      id="canvas-container"
      className="relative w-full h-full select-none cursor-default overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 2.0, 5.5], fov: 60, near: 0.1, far: 50 }}
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
          {isMission1 && (
            <ThirdPersonController
              isInputPaused={isInputPaused}
              characterVariant="boy"
              initialPosition={[0, 0, 2.5]}
            />
          )}
          {isMission2 && (
            <ThirdPersonController
              isInputPaused={isInputPaused}
              characterVariant="girl"
              initialPosition={[0, 0, 3.2]}
              bounds={{ minX: -6.0, maxX: 6.0, minZ: -7.5, maxZ: 7.5 }}
              obstacles={[
                [-2.4, 2.4, -4.6, -2.4], // Central electronics workbench
                [2.8, 4.4, -2.8, -1.2],  // ATE measurement console
                [-5.2, -3.8, -1.8, -0.2], // Component storage locker
              ]}
            />
          )}
          {!isMission1 && !isMission2 && (
            <FirstPersonController isInputPaused={isInputPaused} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
