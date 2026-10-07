'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';

interface LockedCabinetProps {
  id: string;
  name: string;
  isLocked?: boolean;
  isUnlocked?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const LockedCabinet: React.FC<LockedCabinetProps> = ({
  id,
  name,
  isLocked = true,
  isUnlocked,
  position = [5.5, 1.5, -3.0],
  rotation = [0, -Math.PI / 2, 0],
  onClick,
  onHover,
}) => {
  const effectiveLocked = isUnlocked !== undefined ? !isUnlocked : isLocked;
  const doorHingeRef = useRef<THREE.Group>(null);

  // Smooth door opening animation when unlocked by Mission Engine
  useFrame((_, delta) => {
    if (doorHingeRef.current) {
      const targetAngle = effectiveLocked ? 0 : -1.35; // Opens ~77 degrees
      doorHingeRef.current.rotation.y = THREE.MathUtils.damp(
        doorHingeRef.current.rotation.y,
        targetAngle,
        4.0,
        delta
      );
    }
  });

  return (
    <InteractiveObject
      id={id}
      name={name}
      isLocked={effectiveLocked}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onHover={onHover}
    >
      <group>
        {/* Outer Heavy Steel Cabinet Body (Back and Sides) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 2.2, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Hollow Interior Cavity */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.1, 2.1, 0.52]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>

        {/* Internal Storage Shelves */}
        {[-0.5, 0, 0.5].map((y, i) => (
          <group key={i} position={[0, y, 0.05]}>
            <mesh>
              <boxGeometry args={[1.08, 0.04, 0.48]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Spare diagnostic multimeter & cables on shelves */}
            {i === 1 && (
              <mesh position={[0.2, 0.06, 0]}>
                <boxGeometry args={[0.2, 0.08, 0.14]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.4} />
              </mesh>
            )}
            {i === 0 && (
              <mesh position={[-0.2, 0.05, 0]}>
                <boxGeometry args={[0.25, 0.06, 0.18]} />
                <meshStandardMaterial color="#0284c7" roughness={0.5} />
              </mesh>
            )}
          </group>
        ))}

        {/* Hinged Cabinet Door (Hinged at left edge x = -0.55) */}
        <group ref={doorHingeRef} position={[-0.55, 0, 0.31]}>
          {/* Main Door Leaf */}
          <mesh position={[0.55, 0, 0]}>
            <boxGeometry args={[1.1, 2.12, 0.03]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Door Handle */}
          <mesh position={[1.0, 0, 0.03]}>
            <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Electronic Lock Keycard / Solenoid Housing */}
          <mesh position={[0.95, 0.18, 0.025]}>
            <boxGeometry args={[0.1, 0.16, 0.02]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
          </mesh>

          {/* Lock Status LED (Red = Locked, Green = Unlocked) */}
          <mesh position={[0.95, 0.22, 0.04]}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshBasicMaterial color={effectiveLocked ? '#ef4444' : '#22c55e'} />
          </mesh>
        </group>
      </group>
    </InteractiveObject>
  );
};
