'use client';

import React from 'react';
import { InteractiveObject } from './InteractiveObject';

interface DrainageTrayProps {
  id: string;
  name: string;
  isLocked?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const DrainageTray: React.FC<DrainageTrayProps> = ({
  id,
  name,
  isLocked = false,
  position = [-2.0, 0.05, -4.5],
  rotation = [0, 0, 0],
  onClick,
  onHover,
}) => {
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
        {/* Stainless Steel Condensate Catch Basin Rim */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.08, 1.2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Recessed Basin Interior Floor */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.1, 0.05, 1.1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.5} />
        </mesh>

        {/* Drain Valve Outlet Pipe */}
        <mesh position={[0.58, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </InteractiveObject>
  );
};
