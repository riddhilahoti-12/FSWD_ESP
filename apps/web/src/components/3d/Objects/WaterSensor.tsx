'use client';

import React from 'react';
import { InteractiveObject } from './InteractiveObject';

interface WaterSensorProps {
  id: string;
  name: string;
  isLocked?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  voltage?: number;
  isWet?: boolean;
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const WaterSensor: React.FC<WaterSensorProps> = ({
  id,
  name,
  isLocked = false,
  position = [-2.0, 0.1, -4.5],
  rotation = [0, 0, 0],
  voltage = 0.0,
  isWet = false,
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
        {/* PCB Sensor Substrate (Resistive Water Detector) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.25, 0.015, 0.4]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Interleaved Gold/Copper Sensor Traces */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-0.08 + i * 0.02, 0.009, 0.05]}>
            <boxGeometry args={[0.008, 0.004, 0.25]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Signal Processing Enclosure Pod at the top */}
        <mesh position={[0, 0.02, -0.13]}>
          <boxGeometry args={[0.22, 0.035, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Power / Logic Status LED (Green = Dry 0.0V, Red = Wet) */}
        <mesh position={[0.07, 0.04, -0.13]}>
          <sphereGeometry args={[0.01, 16, 16]} />
          <meshBasicMaterial color={isWet ? '#ef4444' : '#22c55e'} />
        </mesh>

        {/* Cable Harness */}
        <mesh position={[0, 0.02, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>
    </InteractiveObject>
  );
};
