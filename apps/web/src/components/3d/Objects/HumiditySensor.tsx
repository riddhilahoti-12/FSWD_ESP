'use client';

import React from 'react';
import { InteractiveObject } from './InteractiveObject';

interface HumiditySensorProps {
  id: string;
  name: string;
  isLocked?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  reading?: string;
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const HumiditySensor: React.FC<HumiditySensorProps> = ({
  id,
  name,
  isLocked = false,
  position = [2.8, 1.8, -3.0],
  rotation = [0, 0, 0],
  reading = '68.0%',
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
        {/* Wall Backplate */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[0.26, 0.44, 0.02]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Industrial Transmitter Housing (Dark Cyan/Slate) */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.22, 0.28, 0.09]} />
          <meshStandardMaterial color="#0e7490" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Digital Humidity LCD Display */}
        <mesh position={[0, 0.08, 0.048]}>
          <planeGeometry args={[0.16, 0.07]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
        </mesh>

        {/* Industrial Stainless Steel Sintered Sensor Probe below */}
        <mesh position={[0, -0.15, 0.02]}>
          <cylinderGeometry args={[0.035, 0.035, 0.16, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Sintered Filter Rings */}
        {[-0.12, -0.16, -0.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0.02]}>
            <cylinderGeometry args={[0.038, 0.038, 0.015, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.5} />
          </mesh>
        ))}

        {/* Power / Signal Cable Gland */}
        <mesh position={[0, -0.25, 0.02]}>
          <cylinderGeometry args={[0.018, 0.018, 0.06, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>
    </InteractiveObject>
  );
};
