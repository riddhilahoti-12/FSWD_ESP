'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ServerRackProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  unitCount?: number;
}

export const ServerRack: React.FC<ServerRackProps> = ({
  position,
  rotation = [0, 0, 0],
  unitCount = 7,
}) => {
  const ledRef = useRef<THREE.InstancedMesh>(null);

  // Generate random blink offsets for status LEDs
  const ledData = useMemo(() => {
    return Array.from({ length: 24 }).map(() => ({
      speed: 1.5 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!ledRef.current) return;
    const time = clock.getElapsedTime();
    const tempColor = new THREE.Color();

    for (let i = 0; i < 24; i++) {
      const { speed, phase } = ledData[i];
      const brightness = Math.sin(time * speed + phase) > 0.3 ? 1.0 : 0.15;
      // Alternate between cyan/blue and green datacenter server LEDs
      if (i % 3 === 0) {
        tempColor.setRGB(0, brightness * 0.8, brightness * 1.0);
      } else {
        tempColor.setRGB(0, brightness * 0.9, brightness * 0.3);
      }
      ledRef.current.setColorAt(i, tempColor);
    }
    ledRef.current.instanceColor!.needsUpdate = true;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Steel Outer Frame */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 2.8, 1.1]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Recessed Interior Bay */}
      <mesh position={[0, 1.4, 0.05]}>
        <boxGeometry args={[0.82, 2.7, 0.95]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Modular Server Chassis Units */}
      {Array.from({ length: unitCount }).map((_, idx) => {
        const yPos = 0.3 + idx * 0.35;
        return (
          <group key={idx} position={[0, yPos, 0.1]}>
            {/* Chassis Faceplate */}
            <mesh>
              <boxGeometry args={[0.78, 0.3, 0.85]} />
              <meshStandardMaterial
                color="#1e293b"
                metalness={0.7}
                roughness={0.4}
              />
            </mesh>

            {/* Drive Bay Tray Lines */}
            <mesh position={[0, 0, 0.43]}>
              <boxGeometry args={[0.74, 0.26, 0.02]} />
              <meshStandardMaterial
                color="#0f172a"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>

            {/* Ventilation Honeycomb Strip */}
            <mesh position={[-0.15, 0, 0.445]}>
              <planeGeometry args={[0.35, 0.18]} />
              <meshStandardMaterial
                color="#090d16"
                roughness={0.9}
              />
            </mesh>
          </group>
        );
      })}

      {/* Instanced Blinking Activity LEDs on Faceplates */}
      <instancedMesh
        ref={ledRef}
        args={[undefined, undefined, 24]}
        position={[0.22, 0.4, 0.55]}
      >
        <boxGeometry args={[0.02, 0.02, 0.01]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Front Perforated Tinted Glass / Mesh Door */}
      <mesh position={[0, 1.4, 0.56]}>
        <boxGeometry args={[0.84, 2.72, 0.02]} />
        <meshPhysicalMaterial
          color="#0f172a"
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.9}
          transmission={0.6}
          ior={1.4}
        />
      </mesh>

      {/* Roof Top Exhaust Fan Grills */}
      <mesh position={[0, 2.81, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.03, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
};
