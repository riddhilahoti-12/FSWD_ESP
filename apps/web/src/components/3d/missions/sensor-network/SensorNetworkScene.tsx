'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MissionState } from '@missionx/shared';
import { InteractiveObject } from '../../Objects/InteractiveObject';
import { ExitDoor } from '../../Objects/ExitDoor';
import { LockedCabinet } from '../../Objects/LockedCabinet';
import { HintBuzzer } from '../../Objects/HintBuzzer';
import { EnvironmentEffects } from '../../Room/EnvironmentEffects';

interface SceneProps {
  missionState: MissionState;
  onObjectClick: (objectId: string) => void;
  onObjectHover: (objectId: string | null, name: string | null, isLocked: boolean) => void;
}

export const SensorNetworkScene: React.FC<SceneProps> = ({
  missionState,
  onObjectClick,
  onObjectHover,
}) => {
  const { unlockedObjects, completedStages, activeStage, isExitUnlocked } = missionState;

  const isStage2Done = completedStages.includes(2);
  const isStage3Done = completedStages.includes(3);
  const isStage4Done = completedStages.includes(4);

  const wifiWaveRef = useRef<THREE.Mesh>(null);
  const packetRef = useRef<THREE.Mesh>(null);
  const switchLedsRef = useRef<THREE.Group>(null);

  // Subtle pulsing visual animations for RF transmission and packet activity
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wifiWaveRef.current) {
      const s = 1 + Math.sin(t * 3) * 0.15;
      wifiWaveRef.current.scale.set(s, s, s);
    }

    // Packet flowing animation along the topology link
    if (packetRef.current) {
      const progress = (t * 0.8) % 1;
      // Interpolate along path: Node C -> AP -> Switch -> Gateway
      const startX = 0.4;
      const endX = -0.8;
      packetRef.current.position.x = startX + (endX - startX) * progress;
      packetRef.current.position.y = 0.35 + Math.sin(progress * Math.PI) * 0.1;
    }

    // Random blinking switch activity LEDs
    if (switchLedsRef.current) {
      switchLedsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const blink = Math.sin(t * (10 + i * 3)) > 0.1 ? 0.9 : 0.2;
          (mesh.material as THREE.MeshBasicMaterial).opacity = blink;
        }
      });
    }
  });

  return (
    <group name="SensorNetworkScene">
      {/* 1. Structural NOC Room Shell */}
      {/* Anti-static Dark Matrix Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#080c16" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Blue Matrix Grid */}
      <gridHelper
        args={[18, 18, '#6366f1', '#1e1b4b']}
        position={[0, 0.01, 0]}
      />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#030712" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0a0f1d" roughness={0.7} />
      </mesh>
      {/* Technical Trim Stripes */}
      <mesh position={[0, 2.4, -8.98]}>
        <planeGeometry args={[14, 0.08]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 2.25, -8.98]}>
        <planeGeometry args={[14, 0.03]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>

      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0a0f1d" roughness={0.7} />
      </mesh>

      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#080d19" roughness={0.7} />
      </mesh>
      <mesh position={[-6.98, 2.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.5} />
      </mesh>

      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#080d19" roughness={0.7} />
      </mesh>
      <mesh position={[6.98, 2.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.5} />
      </mesh>

      {/* Structural Corner Beams */}
      {[
        [-6.9, 0, -8.9],
        [6.9, 0, -8.9],
        [-6.9, 0, 8.9],
        [6.9, 0, 8.9],
      ].map(([x, , z], idx) => (
        <group key={idx} position={[x, 2.75, z]}>
          <mesh>
            <boxGeometry args={[0.45, 5.5, 0.45]} />
            <meshStandardMaterial color="#1e1b4b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.48, 5.5, 0.05]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.25} />
          </mesh>
        </group>
      ))}

      {/* Overhead Yellow Fiber Raceway Troughs */}
      <group position={[0, 4.6, -3.8]}>
        <mesh>
          <boxGeometry args={[12, 0.1, 0.5]} />
          <meshStandardMaterial color="#eab308" roughness={0.4} />
        </mesh>
        {/* Support Drops */}
        <mesh position={[-4, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        <mesh position={[4, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        {/* Fiber Cable Bundles */}
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 11.8, 12]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.5} />
        </mesh>
      </group>

      {/* Ceiling Fluorescent Panels */}
      {[
        [-2.5, 5.4, -3.5],
        [2.5, 5.4, -3.5],
        [0, 5.4, 1.5],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[2.4, 0.1, 0.8]} />
            <meshStandardMaterial color="#1e1b4b" />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <planeGeometry args={[2.2, 0.6]} />
            <meshBasicMaterial color="#c7d2fe" />
          </mesh>
          <pointLight position={[0, -0.2, 0]} intensity={1.1} distance={8} color="#a5b4fc" />
        </group>
      ))}

      {/* NOC Lighting */}
      <ambientLight intensity={0.35} color="#c7d2fe" />
      <directionalLight position={[0, 5, -2]} intensity={0.7} color="#818cf8" />
      <pointLight position={[0, 3, -4.5]} intensity={1.6} distance={9} color="#38bdf8" />
      <pointLight position={[-1.5, 2.5, -4]} intensity={1.2} distance={6} color="#4f46e5" />

      {/* Atmospheric Particulate */}
      <EnvironmentEffects />

      {/* 2. NOC Wall-Mounted Telemetry Screen (Stage 1 Centerpiece) */}
      <InteractiveObject
        id="monitoring_screen"
        name="NOC Status Telemetry Display"
        position={[0.0, 2.3, -4.8]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.6, 2.0, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Glowing Screen Panel */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[3.4, 1.8]} />
          <meshBasicMaterial color="#030712" />
        </mesh>

        {/* Multi-monitor Header Bar */}
        <mesh position={[0, 0.78, 0.048]}>
          <planeGeometry args={[3.3, 0.14]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>

        {/* Network Topology Lines */}
        <mesh position={[-0.4, 0.2, 0.048]}>
          <planeGeometry args={[2.4, 0.02]} />
          <meshBasicMaterial color="#312e81" />
        </mesh>

        {/* Dynamic Packet Indicator */}
        <mesh ref={packetRef} position={[0.4, 0.35, 0.055]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Node Indicators on Screen */}
        {/* Node A (Green) */}
        <group position={[-1.2, 0.35, 0.05]}>
          <mesh>
            <circleGeometry args={[0.09, 16]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
        {/* Node B (Green) */}
        <group position={[-0.4, 0.35, 0.05]}>
          <mesh>
            <circleGeometry args={[0.09, 16]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
        {/* Node C (Red if stage < 4, Green once restored) */}
        <group position={[0.4, 0.35, 0.05]}>
          <mesh>
            <circleGeometry args={[0.11, 16]} />
            <meshBasicMaterial color={isStage4Done ? '#22c55e' : '#ef4444'} />
          </mesh>
          <pointLight
            position={[0, 0, 0.05]}
            intensity={0.8}
            distance={1.5}
            color={isStage4Done ? '#22c55e' : '#ef4444'}
          />
        </group>
        {/* Node D (Green) */}
        <group position={[1.2, 0.35, 0.05]}>
          <mesh>
            <circleGeometry args={[0.09, 16]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>

        {/* Central AP & Switch Glyphs on Screen */}
        <mesh position={[0, -0.3, 0.05]}>
          <planeGeometry args={[1.6, 0.35]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </InteractiveObject>

      {/* 3. Field Sensor Node Workbench (Stage 1) */}
      <InteractiveObject
        id="sensor_nodes"
        name="Field IoT Sensor Nodes Bench"
        position={[2.5, 0.9, -2.5]}
        rotation={[0, -Math.PI / 4, 0]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Table Top */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.08, 1.1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Table Legs */}
        {[
          [-1.0, -0.45, -0.45],
          [1.0, -0.45, -0.45],
          [-1.0, -0.45, 0.45],
          [1.0, -0.45, 0.45],
        ].map(([lx, ly, lz], idx) => (
          <mesh key={idx} position={[lx, ly, lz]}>
            <boxGeometry args={[0.08, 0.9, 0.08]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        ))}

        {/* 4 Sensor Node Modules with External Antennas */}
        {[-0.65, -0.22, 0.22, 0.65].map((nx, idx) => {
          const isNodeC = idx === 2;
          const nodeColor = isNodeC && !isStage4Done ? '#7f1d1d' : '#0f766e';
          return (
            <group key={idx} position={[nx, 0.08, 0]}>
              <mesh>
                <boxGeometry args={[0.22, 0.08, 0.22]} />
                <meshStandardMaterial color={nodeColor} metalness={0.4} />
              </mesh>
              {/* Antenna */}
              <mesh position={[0.08, 0.12, 0.08]}>
                <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Status LED */}
              <mesh position={[0, 0.045, 0.08]}>
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial color={isNodeC && !isStage4Done ? '#ef4444' : '#22c55e'} />
              </mesh>
            </group>
          );
        })}
      </InteractiveObject>

      {/* 4. Network Rack Frame Housing Switch, Router & Gateway */}
      <group position={[-1.8, 1.4, -4.0]}>
        {/* 19" Rack Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.05, 2.3, 0.85]} />
          <meshStandardMaterial color="#1e293b" wireframe />
        </mesh>

        {/* 24-Port Managed Switch (Stage 2) */}
        <InteractiveObject
          id="network_switch"
          name="Managed L2+ Ethernet Switch"
          position={[0, 0.2, 0]}
          isLocked={activeStage?.id !== 'stage-2'}
          onClick={onObjectClick}
          onHover={onObjectHover}
        >
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.92, 0.2, 0.62]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Port 3 Fault LED */}
          <mesh position={[-0.1, 0.04, 0.32]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color={isStage2Done ? '#22c55e' : '#ef4444'} />
          </mesh>
          {/* Animated Switch Activity LEDs */}
          <group ref={switchLedsRef} position={[0.15, 0.04, 0.32]}>
            {[-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1].map((lx, li) => (
              <mesh key={li} position={[lx, 0, 0]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshBasicMaterial color="#22c55e" transparent />
              </mesh>
            ))}
          </group>
        </InteractiveObject>

        {/* Core Edge Router (Stage 2) */}
        <InteractiveObject
          id="router"
          name="Enterprise Core Router"
          position={[0, -0.22, 0]}
          isLocked={activeStage?.id !== 'stage-2'}
          onClick={onObjectClick}
          onHover={onObjectHover}
        >
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.92, 0.26, 0.62]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.05, 0.32]}>
            <planeGeometry args={[0.35, 0.09]} />
            <meshBasicMaterial color="#0369a1" />
          </mesh>
        </InteractiveObject>

        {/* Central Gateway Hub (Stage 4) */}
        <InteractiveObject
          id="central_gateway"
          name="Central IoT Gateway Hub"
          position={[0, 0.62, 0]}
          isLocked={activeStage?.id !== 'stage-4'}
          onClick={onObjectClick}
          onHover={onObjectHover}
        >
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.92, 0.32, 0.62]} />
            <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Gateway Status Beacon */}
          <mesh position={[0.3, 0.08, 0.32]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color={isStage4Done ? '#22c55e' : '#38bdf8'} />
          </mesh>
        </InteractiveObject>
      </group>

      {/* 5. Industrial Wireless Access Point (Stage 3) */}
      <InteractiveObject
        id="wireless_ap"
        name="Industrial Wireless Access Point"
        position={[1.5, 3.2, -4.0]}
        isLocked={activeStage?.id !== 'stage-3'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Saucer Housing */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.1, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        {/* Blue Center Ring */}
        <mesh position={[0, -0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.18, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Pulsing RF Wave visualization */}
        <mesh ref={wifiWaveRef} position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.46, 32]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </InteractiveObject>

      {/* 6. Packet Route Selection Console (Stage 3) */}
      <InteractiveObject
        id="packet_console"
        name="Packet Route Selection Console"
        position={[-3.5, 1.4, -2.0]}
        rotation={[0, Math.PI / 3, 0]}
        isLocked={activeStage?.id !== 'stage-3'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.85, 1.4, 0.65]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.95, 0.6, 0.08]} />
          <meshStandardMaterial color="#4338ca" />
        </mesh>
        <mesh position={[0, 0.16, 0.05]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.85, 0.5]} />
          <meshBasicMaterial color={isStage3Done ? '#15803d' : '#1e1b4b'} />
        </mesh>
      </InteractiveObject>

      {/* 7. Diagnostic Hint Buzzer on Desk */}
      <HintBuzzer
        id="hint_buzzer"
        name="Diagnostic Hint Buzzer"
        position={[2.0, 0.95, -2.1]}
        rotation={[0, -Math.PI / 4, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 8. Fiber Patch Cabinet */}
      <LockedCabinet
        id="network_cabinet"
        name="Fiber Patch Enclosure"
        isUnlocked={unlockedObjects.includes('network_cabinet') || isStage2Done}
        position={[-4.5, 1.5, 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 9. NOC Security Exit Door */}
      <ExitDoor
        id="exit_door"
        name="NOC Security Exit Portal"
        isOpen={isExitUnlocked}
        position={[4.5, 1.5, 0.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />
    </group>
  );
};
