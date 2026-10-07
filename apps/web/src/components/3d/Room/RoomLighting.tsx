'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RoomLightingProps {
  isWarningActive?: boolean;
  isEmergencyActive?: boolean;
}

export default function RoomLighting({
  isWarningActive = true,
  isEmergencyActive = false,
}: RoomLightingProps) {
  const warningLightRef = useRef<THREE.PointLight>(null);

  // Pulse the warning alarm light smoothly
  useFrame(({ clock }) => {
    if (warningLightRef.current) {
      if (isWarningActive) {
        const t = clock.getElapsedTime();
        const intensity = 1.0 + Math.sin(t * 4) * 0.8;
        warningLightRef.current.intensity = Math.max(0.2, intensity);
      } else {
        warningLightRef.current.intensity = 0;
      }
    }
  });

  return (
    <group name="RoomLighting">
      {/* 1. Ambient Technical Baseline (Cool Slate-Navy) */}
      <ambientLight color="#1e293b" intensity={0.65} />

      {/* 2. Main Directional Key Fill */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={0.8}
        color="#e2e8f0"
        castShadow={false}
      />

      {/* 3. Fluorescent Overhead Strip Lights */}
      {[-4, 0, 4].map((z, idx) => (
        <group key={idx} position={[0, 5.2, z]}>
          {/* Light Fixture Housing */}
          <mesh>
            <boxGeometry args={[4, 0.08, 0.4]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Glowing Diffuser Lens */}
          <mesh position={[0, -0.04, 0]}>
            <boxGeometry args={[3.8, 0.02, 0.3]} />
            <meshBasicMaterial color="#e0f2fe" />
          </mesh>
          {/* Local Area Downlight */}
          <pointLight
            position={[0, -0.3, 0]}
            color="#bae6fd"
            intensity={1.2}
            distance={8}
            decay={2}
          />
        </group>
      ))}

      {/* 4. Dynamic Warning Alert Point Light (Above Cooling Unit & Beacon) */}
      <pointLight
        ref={warningLightRef}
        position={[-1.5, 2.5, -4.0]}
        color="#ef4444"
        intensity={isWarningActive ? 1.5 : 0}
        distance={9}
        decay={2}
      />

      {/* 5. Blue Server Rack Accent Fill (Floor Uplight) */}
      <pointLight
        position={[0, 0.4, 0]}
        color="#0284c7"
        intensity={0.4}
        distance={6}
        decay={2}
      />
    </group>
  );
}
