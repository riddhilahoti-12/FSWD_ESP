'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';

interface WarningBeaconProps {
  id: string;
  name: string;
  isLocked?: boolean;
  state?: 'OFF' | 'WARNING' | 'ACTIVE'; // Driven by mission state
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const WarningBeacon: React.FC<WarningBeaconProps> = ({
  id,
  name,
  isLocked = false,
  state = 'ACTIVE',
  position = [-1.5, 2.2, -4.0],
  rotation = [0, 0, 0],
  onClick,
  onHover,
}) => {
  const domeRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!domeRef.current || state === 'OFF') {
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }

    const t = clock.getElapsedTime();
    const speed = state === 'ACTIVE' ? 8.0 : 3.0; // Strobe rate
    const intensity = (Math.sin(t * speed) + 1) / 2;

    const mat = domeRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.5 + intensity * 2.5;

    if (lightRef.current) {
      lightRef.current.intensity = intensity * 3.0;
    }
  });

  const emissiveColor = state === 'WARNING' ? '#f59e0b' : '#ef4444';

  return (
    <InteractiveObject
      id={id}
      name={name}
      isLocked={isLocked}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onHover={onHover}
    >
      <group>
        {/* Wall Mounting Stanchion / Bracket */}
        <mesh position={[0, -0.1, -0.05]}>
          <boxGeometry args={[0.15, 0.2, 0.1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Heavy Cylindrical Base Collar */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.06, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Warning Strobe Dome */}
        <mesh ref={domeRef} position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.12, 24]} />
          <meshStandardMaterial
            color={state === 'OFF' ? '#475569' : emissiveColor}
            emissive={state === 'OFF' ? '#000000' : emissiveColor}
            emissiveIntensity={state === 'OFF' ? 0 : 2.0}
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Dynamic Warning Strobe Point Light */}
        {state !== 'OFF' && (
          <pointLight
            ref={lightRef}
            color={emissiveColor}
            distance={4.0}
            decay={2}
            intensity={2.0}
            position={[0, 0.1, 0]}
          />
        )}
      </group>
    </InteractiveObject>
  );
};
