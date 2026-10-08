'use client';

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { InteractiveObject } from './InteractiveObject';
import { soundEffects } from '../Sound/soundEffects';

interface HintBuzzerProps {
  id?: string;
  name?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onPress?: () => void;
  onClick?: (id: string) => void;
  onHover?: (id: string | null, name: string | null, isLocked: boolean) => void;
}

export const HintBuzzer: React.FC<HintBuzzerProps> = ({
  id = 'hint_buzzer',
  name = 'Diagnostic Hint Buzzer',
  position = [0, 0.95, -3.2],
  rotation = [0, 0, 0],
  onPress,
  onClick,
  onHover,
}) => {
  const plungerRef = useRef<THREE.Mesh>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Smooth press animation and subtle idle pulsing
  useFrame(({ clock }, delta) => {
    if (plungerRef.current) {
      const targetY = isPressed ? 0.04 : 0.08;
      plungerRef.current.position.y = THREE.MathUtils.damp(
        plungerRef.current.position.y,
        targetY,
        15.0,
        delta
      );
    }

    if (glowLightRef.current) {
      const pulse = (Math.sin(clock.getElapsedTime() * 3) + 1) / 2;
      glowLightRef.current.intensity = 0.5 + pulse * 0.4;
    }
  });

  const handleClick = () => {
    soundEffects.playBuzzer();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 250);
    if (onPress) {
      onPress();
    }
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <InteractiveObject
      id={id}
      name={name}
      isLocked={false}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onHover={onHover}
    >
      <group>
        {/* Cast Aluminum Base Enclosure */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.22, 0.04, 0.22]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Mounting Collar Bezel */}
        <mesh position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.075, 0.085, 0.02, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Spring-Loaded Mushroom Button Plunger */}
        <mesh ref={plungerRef} position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.07, 0.065, 0.04, 24]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#d97706"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Top Domed Cap */}
        <mesh position={[0, 0.102, 0]}>
          <sphereGeometry args={[0.068, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Subtle Area Glow */}
        <pointLight
          ref={glowLightRef}
          color="#f59e0b"
          distance={1.5}
          intensity={0.6}
          position={[0, 0.15, 0]}
        />
      </group>
    </InteractiveObject>
  );
};
