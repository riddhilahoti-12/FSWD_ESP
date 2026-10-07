'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const EnvironmentEffects: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate 120 subtle dust/HVAC air motes
  const [positions, velocities] = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Room dimensions: X [-6.5, 6.5], Y [0.2, 5.0], Z [-8.5, 8.5]
      pos[i * 3] = (Math.random() - 0.5) * 13;
      pos[i * 3 + 1] = Math.random() * 4.8 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 17;

      vel[i * 3] = (Math.random() - 0.5) * 0.05;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    return [pos, vel];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < 120; i++) {
      array[i * 3] += velocities[i * 3] * delta;
      array[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      array[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Wrap around bounds
      if (array[i * 3] < -6.5) array[i * 3] = 6.5;
      if (array[i * 3] > 6.5) array[i * 3] = -6.5;
      if (array[i * 3 + 1] < 0.2) array[i * 3 + 1] = 4.8;
      if (array[i * 3 + 1] > 5.0) array[i * 3 + 1] = 0.3;
      if (array[i * 3 + 2] < -8.5) array[i * 3 + 2] = 8.5;
      if (array[i * 3 + 2] > 8.5) array[i * 3 + 2] = -8.5;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#38bdf8"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};
