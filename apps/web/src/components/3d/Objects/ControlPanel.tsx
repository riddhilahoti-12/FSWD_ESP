'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';

interface ControlPanelProps {
  id: string;
  name: string;
  isLocked?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  id,
  name,
  isLocked = true,
  position = [0.0, 1.5, -4.8],
  rotation = [0, 0, 0],
  onClick,
  onHover,
}) => {
  const screenGlowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (screenGlowRef.current) {
      const pulse = (Math.sin(clock.getElapsedTime() * 2) + 1) / 2;
      (screenGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        isLocked ? 0.2 : 0.6 + pulse * 0.3;
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
        {/* Wall Backing & Enclosure Box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.7, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Brushed Metal Bezel Frame */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.84, 0.64, 0.02]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Main LCD Diagnostic Screen */}
        <mesh position={[-0.15, 0.08, 0.075]}>
          <planeGeometry args={[0.42, 0.36]} />
          <meshBasicMaterial color="#020617" />
        </mesh>

        {/* Screen Interface Display Glow */}
        <mesh ref={screenGlowRef} position={[-0.15, 0.08, 0.076]}>
          <planeGeometry args={[0.4, 0.34]} />
          <meshBasicMaterial
            color={isLocked ? '#f59e0b' : '#06b6d4'}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Authorization Keypad Matrix (Right Side) */}
        <group position={[0.22, 0.08, 0.075]}>
          <mesh>
            <planeGeometry args={[0.24, 0.34]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
          </mesh>

          {/* 3x4 Keypad Buttons */}
          {[-0.08, 0, 0.08].map((x, col) =>
            [-0.1, -0.03, 0.04, 0.11].map((y, row) => (
              <mesh key={`${col}-${row}`} position={[x, y, 0.01]}>
                <boxGeometry args={[0.05, 0.045, 0.015]} />
                <meshStandardMaterial
                  color="#475569"
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            ))
          )}
        </group>

        {/* Emergency Circuit Breaker Switch (Bottom Center) */}
        <group position={[0, -0.19, 0.075]}>
          <mesh>
            <boxGeometry args={[0.74, 0.14, 0.03]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Breaker Toggle Lever */}
          <mesh position={[-0.2, 0, 0.02]} rotation={[isLocked ? 0.3 : -0.3, 0, 0]}>
            <boxGeometry args={[0.06, 0.08, 0.04]} />
            <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Breaker Label Strip */}
          <mesh position={[0.1, 0, 0.016]}>
            <planeGeometry args={[0.4, 0.05]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>

        {/* Top Status Indicator Bank */}
        {[-0.32, -0.24, -0.16].map((x, i) => (
          <mesh key={i} position={[x, 0.28, 0.075]}>
            <sphereGeometry args={[0.014, 16, 16]} />
            <meshBasicMaterial
              color={
                i === 0
                  ? isLocked
                    ? '#ef4444'
                    : '#22c55e'
                  : i === 1
                  ? '#38bdf8'
                  : '#fbbf24'
              }
            />
          </mesh>
        ))}
      </group>
    </InteractiveObject>
  );
};
