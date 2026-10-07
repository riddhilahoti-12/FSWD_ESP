'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';

interface AlarmBuzzerProps {
  id: string;
  name: string;
  isLocked?: boolean;
  isActive?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const AlarmBuzzer: React.FC<AlarmBuzzerProps> = ({
  id,
  name,
  isLocked = false,
  isActive = true,
  position = [-1.2, 2.2, -4.0],
  rotation = [0, 0, 0],
  onClick,
  onHover,
}) => {
  const soundWaveRef = useRef<THREE.Mesh>(null);

  // Subtle pulsating sound wave ring animation when buzzer is sounding
  useFrame(({ clock }) => {
    if (soundWaveRef.current) {
      if (isActive) {
        const t = (clock.getElapsedTime() * 3) % 1;
        soundWaveRef.current.scale.set(1 + t * 0.8, 1 + t * 0.8, 1);
        (soundWaveRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.6;
      } else {
        soundWaveRef.current.scale.set(1, 1, 1);
        (soundWaveRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }
  });

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
        {/* Wall Backplate */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[0.2, 0.25, 0.02]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Industrial Horn / Piezo Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.18, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Flared Acoustic Sound Horn */}
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.04, 0.08, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Concentric Sound Grille Slots */}
        {[0.02, 0.04, 0.06].map((r, i) => (
          <mesh key={i} position={[0, 0, 0.101]}>
            <ringGeometry args={[r - 0.005, r, 24]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={isActive ? 0.8 : 0.2} />
          </mesh>
        ))}

        {/* Pulsating Visual Sound Wave Ring */}
        <mesh ref={soundWaveRef} position={[0, 0, 0.11]}>
          <ringGeometry args={[0.065, 0.08, 32]} />
          <meshBasicMaterial color="#f87171" transparent opacity={0} />
        </mesh>
      </group>
    </InteractiveObject>
  );
};
