'use client';

import React from 'react';
import * as THREE from 'three';

interface ServerRoomShellProps {
  width?: number;
  depth?: number;
  height?: number;
}

export default function ServerRoomShell({
  width = 14,
  depth = 18,
  height = 5.5,
}: ServerRoomShellProps) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const halfH = height / 2;

  return (
    <group name="ServerRoomShell">
      {/* 1. Floor: Raised Datacenter Floor with Perforated Tile Grid */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#0b101d"
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Floor Grid Lines (Aisle Tile Markers) */}
      <gridHelper
        args={[Math.max(width, depth), 18, '#1e293b', '#0f172a']}
        position={[0, 0.01, 0]}
      />

      {/* 2. Ceiling: Recessed Grid */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#060911"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* 3. North Wall (Back) */}
      <mesh position={[0, halfH, -halfD]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#0a0f1d"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Technical Trim Stripe on North Wall */}
      <mesh position={[0, 2.5, -halfD + 0.02]}>
        <planeGeometry args={[width, 0.1]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
      </mesh>

      {/* 4. South Wall (Front with Camera Entry Portal) */}
      <mesh position={[0, halfH, halfD]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#0a0f1d"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* 5. West Wall (Left) */}
      <mesh position={[-halfW, halfH, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial
          color="#080d19"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Technical Trim Stripe on West Wall */}
      <mesh position={[-halfW + 0.02, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 0.1]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>

      {/* 6. East Wall (Right - Exit Door Wall) */}
      <mesh position={[halfW, halfH, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial
          color="#080d19"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Baseboards / Floor Borders */}
      <mesh position={[0, 0.1, -halfD + 0.05]}>
        <boxGeometry args={[width, 0.2, 0.1]} />
        <meshStandardMaterial color="#030508" />
      </mesh>
      <mesh position={[-halfW + 0.05, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.2, depth]} />
        <meshStandardMaterial color="#030508" />
      </mesh>
      <mesh position={[halfW - 0.05, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.2, depth]} />
        <meshStandardMaterial color="#030508" />
      </mesh>

      {/* Corner Columns */}
      {[
        [-halfW + 0.3, -halfD + 0.3],
        [halfW - 0.3, -halfD + 0.3],
        [-halfW + 0.3, halfD - 0.3],
        [halfW - 0.3, halfD - 0.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, halfH, z]}>
          <boxGeometry args={[0.6, height, 0.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
