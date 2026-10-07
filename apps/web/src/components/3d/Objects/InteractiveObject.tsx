'use client';

import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface InteractiveObjectProps {
  id: string;
  name: string;
  isLocked?: boolean;
  isActive?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
  children: React.ReactNode;
}

export const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  id,
  name,
  isLocked = false,
  isActive = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onClick,
  onHover,
  children,
}) => {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);

  // Subtle floating highlight ring animation on hover
  useFrame((_, delta) => {
    if (ringRef.current && hovered) {
      ringRef.current.rotation.z += delta * 1.5;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    if (onHover) {
      onHover(id, name, isLocked);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    if (onHover) {
      onHover(null, null, false);
    }
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}

      {/* Hover visual highlight indicator */}
      {hovered && (
        <group position={[0, 0, 0]}>
          {/* Subtle outline wireframe box */}
          <mesh>
            <boxGeometry args={[1.05, 1.05, 1.05]} />
            <meshBasicMaterial
              color={isLocked ? '#ef4444' : '#06b6d4'}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>

          {/* Glowing indicator ring */}
          <mesh ref={ringRef} position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial
              color={isLocked ? '#f87171' : '#22d3ee'}
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
