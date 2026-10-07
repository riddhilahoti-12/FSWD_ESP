'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';

interface CoolingFanProps {
  id: string;
  name: string;
  isLocked?: boolean;
  isActive?: boolean; // Driven by mission state
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const CoolingFan: React.FC<CoolingFanProps> = ({
  id,
  name,
  isLocked = false,
  isActive = false,
  position = [-2.0, 1.2, -4.5],
  rotation = [0, 0, 0],
  scale = [1.5, 1.5, 1.5],
  onClick,
  onHover,
}) => {
  const bladesRef = useRef<THREE.Group>(null);

  // Rotation animation driven exclusively by isActive state prop
  useFrame((_, delta) => {
    if (bladesRef.current && isActive) {
      bladesRef.current.rotation.z += delta * 18.0; // High-speed industrial RPM
    }
  });

  return (
    <InteractiveObject
      id={id}
      name={name}
      isLocked={isLocked}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onHover={onHover}
    >
      <group>
        {/* Square Heavy Industrial CRAC Housing Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.0, 1.0, 0.35]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Circular Air Duct Tunnel Cavity */}
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.36, 32, 1, true]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>

        {/* Rotating Impeller Blade Group */}
        <group ref={bladesRef} position={[0, 0, 0]}>
          {/* Central Motor Rotor Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.18, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* 6 Aerodynamic Fan Blades */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <group key={i} rotation={[0, 0, angle]}>
                <mesh position={[0.22, 0, 0]} rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[0.22, 0.07, 0.015]} />
                  <meshStandardMaterial
                    color={isActive ? '#0284c7' : '#475569'}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Protective Wire Finger Grille */}
        <group position={[0, 0, 0.18]}>
          {/* Concentric Guard Rings */}
          {[0.16, 0.28, 0.38].map((r, i) => (
            <mesh key={i}>
              <ringGeometry args={[r - 0.008, r, 32]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* Cross Spoke Struts */}
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, i) => (
            <mesh key={i} rotation={[0, 0, ang]}>
              <boxGeometry args={[0.8, 0.012, 0.01]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* Status Indicator LED (Red when stopped, Green when spinning) */}
        <mesh position={[0.42, 0.42, 0.18]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={isActive ? '#22c55e' : '#ef4444'} />
        </mesh>
      </group>
    </InteractiveObject>
  );
};
