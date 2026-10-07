'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';

interface TemperatureSensorProps {
  id: string;
  name: string;
  isLocked?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  reading?: string;
  isAlert?: boolean;
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const TemperatureSensor: React.FC<TemperatureSensorProps> = ({
  id,
  name,
  isLocked = false,
  position = [2.5, 1.8, -3.0],
  rotation = [0, 0, 0],
  reading = '31.8°C',
  isAlert = true,
  onClick,
  onHover,
}) => {
  const alertLedRef = useRef<THREE.Mesh>(null);

  // Warning pulse if overheating
  useFrame(({ clock }) => {
    if (alertLedRef.current && isAlert) {
      const pulse = (Math.sin(clock.getElapsedTime() * 4) + 1) / 2;
      (alertLedRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.7;
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
        {/* Wall Mounting Plate */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[0.32, 0.42, 0.02]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Industrial Sensor Enclosure Body (DHT22 style) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.26, 0.36, 0.08]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Slotted Air Sensing Vents */}
        {[-0.08, -0.04, 0, 0.04, 0.08].map((yOff, i) => (
          <mesh key={i} position={[0, yOff + 0.06, 0.042]}>
            <boxGeometry args={[0.18, 0.015, 0.005]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.8} />
          </mesh>
        ))}

        {/* Digital OLED/LCD Telemetry Screen */}
        <mesh position={[0, -0.07, 0.042]}>
          <boxGeometry args={[0.2, 0.09, 0.008]} />
          <meshBasicMaterial color="#020617" />
        </mesh>

        {/* Screen Display Face Glow */}
        <mesh position={[0, -0.07, 0.047]}>
          <planeGeometry args={[0.18, 0.07]} />
          <meshBasicMaterial
            color={isAlert ? '#ef4444' : '#06b6d4'}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Status Indicator LED */}
        <mesh ref={alertLedRef} position={[0.08, 0.14, 0.042]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshBasicMaterial
            color={isAlert ? '#ff2222' : '#22c55e'}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Conduit Cable Entry */}
        <mesh position={[0, -0.21, -0.02]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </InteractiveObject>
  );
};
