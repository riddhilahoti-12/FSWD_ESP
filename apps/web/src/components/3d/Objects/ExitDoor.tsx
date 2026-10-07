'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';

interface ExitDoorProps {
  id: string;
  name: string;
  isLocked?: boolean;
  isOpen?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const ExitDoor: React.FC<ExitDoorProps> = ({
  id,
  name,
  isLocked = true,
  isOpen,
  position = [6.85, 1.5, 0.0],
  rotation = [0, -Math.PI / 2, 0],
  scale = [1, 1, 1],
  onClick,
  onHover,
}) => {
  const effectiveLocked = isOpen !== undefined ? !isOpen : isLocked;
  const leftDoorRef = useRef<THREE.Mesh>(null);
  const rightDoorRef = useRef<THREE.Mesh>(null);
  const statusLightRef = useRef<THREE.PointLight>(null);

  // Smooth sliding pneumatic door opening animation when unlocked by Mission Engine
  useFrame((_, delta) => {
    const targetOffset = effectiveLocked ? 0 : 0.75; // slides apart 0.75m each side

    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = THREE.MathUtils.damp(
        leftDoorRef.current.position.x,
        -0.45 - targetOffset,
        3.0,
        delta
      );
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = THREE.MathUtils.damp(
        rightDoorRef.current.position.x,
        0.45 + targetOffset,
        3.0,
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
      scale={scale}
      onClick={onClick}
      onHover={onHover}
    >
      <group>
        {/* Massive Reinforced Door Portal Architrave */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 3.2, 0.25]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Recessed Door Frame Aperture */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.8, 2.9, 0.22]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>

        {/* Overhead Emergency Exit Light Fixture */}
        <group position={[0, 1.45, 0.16]}>
          <mesh>
            <boxGeometry args={[0.7, 0.2, 0.08]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.65, 0.16]} />
            <meshBasicMaterial color={effectiveLocked ? '#ef4444' : '#22c55e'} />
          </mesh>
        </group>

        {/* Left Pneumatic Blast Door Leaf */}
        <mesh ref={leftDoorRef} position={[-0.45, 0, 0.05]}>
          <boxGeometry args={[0.9, 2.85, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Right Pneumatic Blast Door Leaf */}
        <mesh ref={rightDoorRef} position={[0.45, 0, 0.05]}>
          <boxGeometry args={[0.9, 2.85, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Electronic Biometric / Keycard Terminal (Mounted at right side of portal) */}
        <group position={[1.05, 0, 0.15]}>
          <mesh>
            <boxGeometry args={[0.18, 0.4, 0.06]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.08, 0.035]}>
            <planeGeometry args={[0.12, 0.14]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          {/* Status Indicator Scanner Ring */}
          <mesh position={[0, -0.08, 0.035]}>
            <ringGeometry args={[0.03, 0.045, 24]} />
            <meshBasicMaterial color={effectiveLocked ? '#ef4444' : '#22c55e'} />
          </mesh>
          <pointLight
            ref={statusLightRef}
            color={effectiveLocked ? '#ef4444' : '#22c55e'}
            distance={2.0}
            intensity={1.2}
            position={[0, -0.08, 0.1]}
          />
        </group>
      </group>
    </InteractiveObject>
  );
};
