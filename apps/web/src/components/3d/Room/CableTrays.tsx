'use client';

import React from 'react';

interface CableTraysProps {
  roomWidth?: number;
  roomDepth?: number;
  height?: number;
}

export default function CableTrays({
  roomWidth = 14,
  roomDepth = 18,
  height = 4.6,
}: CableTraysProps) {
  return (
    <group name="CableTrays">
      {/* 1. Longitudinal Overhead Yellow Fiber Duct (Along Aisle Z) */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[0.5, 0.15, roomDepth - 3]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* 2. Secondary Left Fiber Duct (Over Rack Row A) */}
      <mesh position={[-3.2, height, 0]}>
        <boxGeometry args={[0.4, 0.12, roomDepth - 4]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* 3. Secondary Right Fiber Duct (Over Rack Row B) */}
      <mesh position={[3.2, height, 0]}>
        <boxGeometry args={[0.4, 0.12, roomDepth - 4]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* 4. Transverse Wire Mesh Cable Ladders */}
      {[-5, 0, 5].map((z, i) => (
        <group key={i} position={[0, height - 0.2, z]}>
          {/* Main Bridge Beam */}
          <mesh>
            <boxGeometry args={[roomWidth - 3, 0.08, 0.4]} />
            <meshStandardMaterial color="#B8C4CE" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Cables along bridge (horizontal along X axis) */}
          <mesh position={[0, 0.06, -0.08]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, roomWidth - 3.2, 8]} />
            <meshStandardMaterial color="#00BFEF" />
          </mesh>
          <mesh position={[0, 0.06, 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, roomWidth - 3.2, 8]} />
            <meshStandardMaterial color="#3B82F6" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
