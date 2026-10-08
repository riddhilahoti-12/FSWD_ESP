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
      {/* 1. Ambient Technical Baseline (Bright Cool-White Lab Illumination) */}
      <ambientLight color="#ffffff" intensity={1.35} />

      {/* 2. Main Directional Key Fill (Even Lab Lighting, No Dark Shadows) */}
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.1}
        color="#f8fafc"
        castShadow={false}
      />
      <directionalLight
        position={[-4, 8, -4]}
        intensity={0.8}
        color="#f1f5f9"
        castShadow={false}
      />

      {/* 3. Fluorescent Overhead Clean Strip Lights */}
      {[-4, 0, 4].map((z, idx) => (
        <group key={idx} position={[0, 5.2, z]}>
          {/* Light Fixture Housing - Silver Gray */}
          <mesh>
            <boxGeometry args={[4, 0.08, 0.4]} />
            <meshStandardMaterial color="#B8C4CE" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Glowing Diffuser Lens - Clean White */}
          <mesh position={[0, -0.04, 0]}>
            <boxGeometry args={[3.8, 0.02, 0.3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Local Area Downlight */}
          <pointLight
            position={[0, -0.3, 0]}
            color="#e0f2fe"
            intensity={1.5}
            distance={10}
            decay={1.8}
          />
        </group>
      ))}

      {/* 4. Dynamic Warning Alert Point Light (Above Cooling Unit & Beacon) */}
      <pointLight
        ref={warningLightRef}
        position={[-1.5, 2.5, -4.0]}
        color="#ef4444"
        intensity={isWarningActive ? 1.6 : 0}
        distance={9}
        decay={2}
      />

      {/* 5. Bright Cyan Server Rack Accent Fill (Floor Uplight) */}
      <pointLight
        position={[0, 0.6, 0]}
        color="#00BFEF"
        intensity={0.6}
        distance={7}
        decay={2}
      />

      {/* 6. Subtle Violet Technical Accent Uplight near power/cabinet */}
      <pointLight
        position={[-3.5, 0.6, 1.0]}
        color="#8B6FF7"
        intensity={0.4}
        distance={6}
        decay={2}
      />
    </group>
  );
}
