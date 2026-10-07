'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MissionState } from '@missionx/shared';
import { InteractiveObject } from '../../Objects/InteractiveObject';
import { ExitDoor } from '../../Objects/ExitDoor';
import { LockedCabinet } from '../../Objects/LockedCabinet';

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
  const dataLedGroupRef = useRef<THREE.Group>(null);

  // Subtle pulsing visual animations for RF transmission and packet activity
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wifiWaveRef.current) {
      const s = 1 + (Math.sin(t * 3) * 0.15);
      wifiWaveRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* 1. Structural NOC Room Shell */}
      {/* Floor - Anti-static Dark Matrix Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#090d16" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#050811" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0b1120" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0b1120" roughness={0.7} />
      </mesh>
      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0a0f1d" roughness={0.7} />
      </mesh>
      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0a0f1d" roughness={0.7} />
      </mesh>

      {/* NOC Lighting */}
      <ambientLight intensity={0.35} color="#c7d2fe" />
      <directionalLight position={[0, 5, -2]} intensity={0.7} color="#818cf8" />
      <pointLight position={[0, 3, -4.5]} intensity={1.5} distance={9} color="#38bdf8" />
      <pointLight position={[-1.5, 2.5, -4]} intensity={1.0} distance={6} color="#4f46e5" />

      {/* 2. NOC Wall-Mounted Telemetry Screen (Stage 1) */}
      <InteractiveObject
        id="monitoring_screen"
        name="NOC Status Telemetry Display"
        position={[0.0, 2.2, -4.8]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 1.8, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Glowing Screen Panel */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[3.0, 1.6]} />
          <meshBasicMaterial color="#030712" />
        </mesh>
        {/* Node Indicators on Screen */}
        {/* Node A (Green) */}
        <mesh position={[-1.0, 0.4, 0.05]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        {/* Node B (Green) */}
        <mesh position={[-0.3, 0.4, 0.05]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        {/* Node C (Red if stage < 4, Green once restored) */}
        <mesh position={[0.4, 0.4, 0.05]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={isStage4Done ? '#22c55e' : '#ef4444'} />
        </mesh>
        {/* Node D (Green) */}
        <mesh position={[1.1, 0.4, 0.05]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#22c55e" />
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
          <boxGeometry args={[2.0, 0.08, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Table Legs */}
        <mesh position={[-0.9, -0.45, -0.4]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.9, -0.45, -0.4]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[-0.9, -0.45, 0.4]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.9, -0.45, 0.4]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* 4 Sensor Node Modules */}
        <mesh position={[-0.6, 0.08, 0]}>
          <boxGeometry args={[0.2, 0.08, 0.2]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
        <mesh position={[-0.2, 0.08, 0]}>
          <boxGeometry args={[0.2, 0.08, 0.2]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
        {/* Node C module with fault indicator */}
        <mesh position={[0.2, 0.08, 0]}>
          <boxGeometry args={[0.2, 0.08, 0.2]} />
          <meshStandardMaterial color={isStage4Done ? '#0f766e' : '#7f1d1d'} />
        </mesh>
        <mesh position={[0.6, 0.08, 0]}>
          <boxGeometry args={[0.2, 0.08, 0.2]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
      </InteractiveObject>

      {/* 4. Network Rack Frame Housing Switch & Router */}
      <group position={[-1.8, 1.4, -4.0]}>
        {/* 19" Rack Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.0, 2.2, 0.8]} />
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
            <boxGeometry args={[0.9, 0.2, 0.6]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Port 3 Fault LED */}
          <mesh position={[-0.1, 0.04, 0.31]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color={isStage2Done ? '#22c55e' : '#ef4444'} />
          </mesh>
        </InteractiveObject>

        {/* Core Edge Router (Stage 2) */}
        <InteractiveObject
          id="router"
          name="Enterprise Core Router"
          position={[0, -0.2, 0]}
          isLocked={activeStage?.id !== 'stage-2'}
          onClick={onObjectClick}
          onHover={onObjectHover}
        >
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.9, 0.25, 0.6]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.05, 0.31]}>
            <planeGeometry args={[0.3, 0.08]} />
            <meshBasicMaterial color="#0369a1" />
          </mesh>
        </InteractiveObject>

        {/* Central Gateway Hub (Stage 4) */}
        <InteractiveObject
          id="central_gateway"
          name="Central IoT Gateway Hub"
          position={[0, 0.6, 0]}
          isLocked={activeStage?.id !== 'stage-4'}
          onClick={onObjectClick}
          onHover={onObjectHover}
        >
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.9, 0.3, 0.6]} />
            <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Gateway Status Beacon */}
          <mesh position={[0.3, 0.08, 0.31]}>
            <sphereGeometry args={[0.03, 16, 16]} />
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
          <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        {/* Blue Center Ring */}
        <mesh position={[0, -0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.16, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Pulsing RF Wave visualization */}
        <mesh ref={wifiWaveRef} position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.44, 32]} />
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
          <boxGeometry args={[0.8, 1.4, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.9, 0.55, 0.08]} />
          <meshStandardMaterial color="#4338ca" />
        </mesh>
        <mesh position={[0, 0.16, 0.05]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.8, 0.45]} />
          <meshBasicMaterial color={isStage3Done ? '#15803d' : '#1e1b4b'} />
        </mesh>
      </InteractiveObject>

      {/* 7. Fiber Patch Cabinet */}
      <LockedCabinet
        id="network_cabinet"
        name="Fiber Patch Enclosure"
        isUnlocked={unlockedObjects.includes('network_cabinet') || isStage2Done}
        position={[-4.5, 1.5, 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 8. NOC Security Exit Door */}
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
