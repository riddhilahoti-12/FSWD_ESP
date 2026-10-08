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
      {/* 1. Floor: Raised Datacenter Floor with Cool Gray Tiles */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#9FAFBC"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Floor Grid Lines (Aisle Tile Markers) */}
      <gridHelper
        args={[Math.max(width, depth), 18, '#8799A8', '#B8C4CE']}
        position={[0, 0.01, 0]}
      />

      {/* Floor Accent Walkway Tiles */}
      {[-2, 0, 2].map((xOffset, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[xOffset, 0.005, 0]}
        >
          <planeGeometry args={[1.2, depth * 0.85]} />
          <meshStandardMaterial
            color="#8799A8"
            roughness={0.5}
            metalness={0.15}
          />
        </mesh>
      ))}

      {/* 2. Ceiling: Bright Clean Lab Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#E2E8F0"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* 3. North Wall (Back) - Light Cool Gray */}
      <mesh position={[0, halfH, -halfD]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#D9E1E8"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Technical Trim Stripe on North Wall - Bright Cyan */}
      <mesh position={[0, 2.5, -halfD + 0.02]}>
        <planeGeometry args={[width, 0.12]} />
        <meshBasicMaterial color="#00BFEF" transparent opacity={0.8} />
      </mesh>

      {/* 4. South Wall (Front Portal) - Soft Gray */}
      <mesh position={[0, halfH, halfD]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#C5D0DA"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* 5. West Wall (Left) - Light Cool Gray */}
      <mesh position={[-halfW, halfH, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial
          color="#D9E1E8"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Technical Trim Stripe on West Wall */}
      <mesh position={[-halfW + 0.02, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 0.12]} />
        <meshBasicMaterial color="#00BFEF" transparent opacity={0.7} />
      </mesh>

      {/* 6. East Wall (Right - Exit Door Wall) - Soft Gray */}
      <mesh position={[halfW, halfH, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial
          color="#C5D0DA"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Technical Trim Stripe on East Wall */}
      <mesh position={[halfW - 0.02, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 0.12]} />
        <meshBasicMaterial color="#00BFEF" transparent opacity={0.7} />
      </mesh>

      {/* Baseboards / Floor Borders - Silver Gray */}
      <mesh position={[0, 0.1, -halfD + 0.05]}>
        <boxGeometry args={[width, 0.2, 0.1]} />
        <meshStandardMaterial color="#B8C4CE" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[-halfW + 0.05, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.2, depth]} />
        <meshStandardMaterial color="#B8C4CE" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[halfW - 0.05, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.2, depth]} />
        <meshStandardMaterial color="#B8C4CE" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Corner Columns - Silver Gray */}
      {[
        [-halfW + 0.3, -halfD + 0.3],
        [halfW - 0.3, -halfD + 0.3],
        [-halfW + 0.3, halfD - 0.3],
        [halfW - 0.3, halfD - 0.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, halfH, z]}>
          <boxGeometry args={[0.6, height, 0.6]} />
          <meshStandardMaterial color="#B8C4CE" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
