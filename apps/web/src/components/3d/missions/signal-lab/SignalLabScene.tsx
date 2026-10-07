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

export const SignalLabScene: React.FC<SceneProps> = ({
  missionState,
  onObjectClick,
  onObjectHover,
}) => {
  const { unlockedObjects, completedStages, activeStage, isExitUnlocked } = missionState;

  const isStage2Done = completedStages.includes(2);
  const isStage3Done = completedStages.includes(3);
  const isStage4Done = completedStages.includes(4);

  const waveRef = useRef<THREE.Line>(null);

  // Animated sinusoidal waveform trace on the oscilloscope screen
  useFrame(({ clock }) => {
    if (waveRef.current) {
      const t = clock.getElapsedTime() * 8;
      const positions = waveRef.current.geometry.attributes.position;
      const count = positions.count;
      for (let i = 0; i < count; i++) {
        const x = (i / (count - 1)) * 0.7 - 0.35;
        // Frequency component with low-pass filtering visual smoothing
        const noise = isStage3Done ? 0 : Math.sin(x * 60 + t * 4) * 0.025;
        const y = Math.sin(x * 16 + t) * 0.12 + noise;
        positions.setXYZ(i, x, y, 0.01);
      }
      positions.needsUpdate = true;
    }
  });

  // Pre-generate wave points
  const waveGeometry = React.useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 0.7 - 0.35;
      points.push(new THREE.Vector3(x, 0, 0.01));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const lineObject = React.useMemo(() => {
    return new THREE.Line(waveGeometry, new THREE.LineBasicMaterial({ color: '#4ade80' }));
  }, [waveGeometry]);

  return (
    <group>
      {/* 1. Laboratory Structural Shell */}
      {/* Floor - Light ESD Dissipative Grey Tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0d1527" roughness={0.7} />
      </mesh>
      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0d1527" roughness={0.7} />
      </mesh>

      {/* Laboratory Overhead Clean Room Lights */}
      <ambientLight intensity={0.4} color="#e0f2fe" />
      <directionalLight position={[0, 5, -2]} intensity={0.8} color="#bae6fd" />
      <pointLight position={[0, 3, -3.5]} intensity={1.2} distance={8} color="#38bdf8" />
      <pointLight position={[3.5, 3, -2]} intensity={0.9} distance={7} color="#22c55e" />

      {/* 2. Central Electronics ESD Workbench */}
      <InteractiveObject
        id="workbench"
        name="Electronics Prototyping Workbench"
        position={[0, 0.8, -3.5]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Table Top */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.2, 0.1, 1.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Blue ESD Mat */}
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[3.8, 0.01, 1.4]} />
          <meshStandardMaterial color="#0284c7" roughness={0.8} />
        </mesh>
        {/* Steel Legs */}
        <mesh position={[-1.9, -0.4, -0.7]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1.9, -0.4, -0.7]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-1.9, -0.4, 0.7]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1.9, -0.4, 0.7]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
      </InteractiveObject>

      {/* 3. Digital Storage Oscilloscope (Stage 1) */}
      <InteractiveObject
        id="oscilloscope"
        name="Digital Storage Oscilloscope"
        position={[-1.2, 1.25, -3.5]}
        rotation={[0, 0.15, 0]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Chassis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.6, 0.45]} />
          <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Screen Bezel */}
        <mesh position={[-0.1, 0.05, 0.23]}>
          <boxGeometry args={[0.65, 0.45, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Phosphor Grid CRT/LCD Screen */}
        <mesh position={[-0.1, 0.05, 0.245]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshBasicMaterial color="#022c22" />
        </mesh>
        {/* Real-time Waveform Line */}
        <primitive object={lineObject} ref={waveRef} position={[-0.1, 0.05, 0.25]} />
        {/* Knobs & BNC Inputs */}
        <mesh position={[0.3, 0.1, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[0.3, -0.08, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} />
        </mesh>
      </InteractiveObject>

      {/* 4. Arbitrary Function Generator (Stage 1) */}
      <InteractiveObject
        id="signal_generator"
        name="Function Synthesizer Generator"
        position={[1.2, 1.25, -3.5]}
        rotation={[0, -0.15, 0]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.85, 0.5, 0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Numerical VFD Display */}
        <mesh position={[-0.12, 0.08, 0.21]}>
          <planeGeometry args={[0.45, 0.2]} />
          <meshBasicMaterial color="#0369a1" />
        </mesh>
        {/* Power LED Indicator */}
        <mesh position={[0.28, 0.15, 0.21]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </InteractiveObject>

      {/* 5. Breadboard Prototyping Array (Stage 2) */}
      <InteractiveObject
        id="breadboard"
        name="Prototyping Breadboard"
        position={[0.0, 0.9, -3.2]}
        isLocked={activeStage?.id !== 'stage-2'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* White Breadboard Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.35]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        {/* Tiny components & Jumper Wires */}
        <mesh position={[-0.15, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#b45309" roughness={0.4} />
        </mesh>
        <mesh position={[0.15, 0.035, 0]}>
          <boxGeometry args={[0.04, 0.05, 0.03]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
      </InteractiveObject>

      {/* 6. Active Filter Selector Module (Stage 3) */}
      <InteractiveObject
        id="filter_module"
        name="Active Op-Amp Filter Module"
        position={[0.0, 1.45, -3.9]}
        isLocked={activeStage?.id !== 'stage-3'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Housing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.65, 0.4, 0.15]} />
          <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Status Mode LED */}
        <mesh position={[0, 0.1, 0.08]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color={isStage3Done ? '#22c55e' : '#f59e0b'} />
        </mesh>
        {/* Filter topology label backing */}
        <mesh position={[0, -0.05, 0.08]}>
          <planeGeometry args={[0.45, 0.15]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </InteractiveObject>

      {/* 7. Main Instrumentation Console (Stage 4) */}
      <InteractiveObject
        id="measurement_console"
        name="ATE Instrumentation Terminal"
        position={[3.5, 1.5, -2.0]}
        rotation={[0, -Math.PI / 3, 0]}
        isLocked={activeStage?.id !== 'stage-4'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Console Pillar Base */}
        <mesh position={[0, -0.75, 0]}>
          <boxGeometry args={[0.8, 1.5, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Angled Touchscreen */}
        <mesh position={[0, 0.15, 0]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.9, 0.6, 0.08]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Glowing Screen Content */}
        <mesh position={[0, 0.16, 0.05]} rotation={[-0.4, 0, 0]}>
          <planeGeometry args={[0.8, 0.5]} />
          <meshBasicMaterial color={isStage4Done ? '#15803d' : '#0369a1'} />
        </mesh>
      </InteractiveObject>

      {/* 8. Component Storage Cabinet */}
      <LockedCabinet
        id="cabinet_02"
        name="Precision Parts Locker"
        isUnlocked={unlockedObjects.includes('cabinet_02') || isStage2Done}
        position={[-4.5, 1.5, -1.0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 9. Laboratory Exit Door */}
      <ExitDoor
        id="exit_door"
        name="Laboratory Exit Portal"
        isOpen={isExitUnlocked}
        position={[4.5, 1.5, 0.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />
    </group>
  );
};
