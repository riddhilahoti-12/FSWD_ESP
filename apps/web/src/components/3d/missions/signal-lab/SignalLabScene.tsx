'use client';

import React, { useRef, useMemo } from 'react';
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
  const probeLedRef = useRef<THREE.Mesh>(null);

  // Animated sinusoidal waveform trace on the oscilloscope screen
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 8;
    if (waveRef.current) {
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

    if (probeLedRef.current) {
      const pulse = 0.5 + Math.sin(t * 2) * 0.5;
      (probeLedRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  // Pre-generate wave points
  const waveGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 0.7 - 0.35;
      points.push(new THREE.Vector3(x, 0, 0.01));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const lineObject = useMemo(() => {
    return new THREE.Line(
      waveGeometry,
      new THREE.LineBasicMaterial({ color: '#22c55e', linewidth: 2 })
    );
  }, [waveGeometry]);

  return (
    <group name="SignalLabScene">
      {/* 1. Laboratory Structural Shell */}
      {/* Floor - Light ESD Dissipative Tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.65} metalness={0.25} />
      </mesh>

      {/* Floor ESD Grid Line Tiles */}
      <gridHelper
        args={[18, 18, '#38bdf8', '#1e293b']}
        position={[0, 0.01, 0]}
      />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#070b13" roughness={0.9} />
      </mesh>

      {/* North Wall (Back) */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0c1222" roughness={0.7} />
      </mesh>
      {/* Wall Technical Trim Stripe (Cyan & Amber) */}
      <mesh position={[0, 2.4, -8.98]}>
        <planeGeometry args={[14, 0.08]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 2.25, -8.98]}>
        <planeGeometry args={[14, 0.03]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} />
      </mesh>

      {/* South Wall (Front) */}
      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#0c1222" roughness={0.7} />
      </mesh>

      {/* West Wall (Left) */}
      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0a0f1d" roughness={0.7} />
      </mesh>
      <mesh position={[-6.98, 2.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>

      {/* East Wall (Right) */}
      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0a0f1d" roughness={0.7} />
      </mesh>
      <mesh position={[6.98, 2.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
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
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.48, 5.5, 0.06]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
          </mesh>
        </group>
      ))}

      {/* Overhead Cable Trays & Industrial Conduit */}
      <group position={[0, 4.6, -3.5]}>
        <mesh>
          <boxGeometry args={[12, 0.08, 0.6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Support Rods */}
        <mesh position={[-4, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[4, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Coax & Signal Cable Bundles */}
        <mesh position={[0, 0.06, -0.15]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 11.8, 12]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.06, 0.15]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 11.8, 12]} />
          <meshStandardMaterial color="#eab308" roughness={0.6} />
        </mesh>
      </group>

      {/* Ceiling Light Fixtures with Glowing Diffuser Panels */}
      {[
        [-2.5, 5.4, -3.5],
        [2.5, 5.4, -3.5],
        [0, 5.4, 1.5],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[2.4, 0.1, 0.8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <planeGeometry args={[2.2, 0.6]} />
            <meshBasicMaterial color="#e0f2fe" />
          </mesh>
          <pointLight position={[0, -0.2, 0]} intensity={1.2} distance={8} color="#bae6fd" />
        </group>
      ))}

      {/* Ambient & Task Lighting */}
      <ambientLight intensity={0.4} color="#e0f2fe" />
      <directionalLight position={[0, 5, -2]} intensity={0.7} color="#bae6fd" />
      <pointLight position={[0, 3, -3.5]} intensity={1.5} distance={9} color="#38bdf8" />
      <pointLight position={[3.5, 3, -2]} intensity={1.0} distance={7} color="#22c55e" />

      {/* Floating Laboratory Particulate */}
      <EnvironmentEffects />

      {/* 2. Central Electronics ESD Prototyping Workbench */}
      <InteractiveObject
        id="workbench"
        name="Electronics Prototyping Workbench"
        position={[0, 0.8, -3.5]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Table Top */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.4, 0.1, 1.9]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Blue ESD Mat */}
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[4.0, 0.01, 1.5]} />
          <meshStandardMaterial color="#0284c7" roughness={0.8} />
        </mesh>
        {/* Grounding Snap Stud */}
        <mesh position={[-1.9, 0.065, 0.65]}>
          <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
        {/* Steel Legs */}
        {[
          [-2.0, -0.4, -0.75],
          [2.0, -0.4, -0.75],
          [-2.0, -0.4, 0.75],
          [2.0, -0.4, 0.75],
        ].map(([lx, ly, lz], idx) => (
          <mesh key={idx} position={[lx, ly, lz]}>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Overhead Tool & Probe Shelf */}
        <group position={[0, 0.85, -0.6]}>
          <mesh>
            <boxGeometry args={[4.2, 0.05, 0.45]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
          {/* Support Brackets */}
          <mesh position={[-1.9, -0.4, 0]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[1.9, -0.4, 0]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#475569" />
          </mesh>

          {/* Precision DC Laboratory Power Supply on Shelf */}
          <group position={[-1.1, 0.22, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 0.38, 0.35]} />
              <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* VFD Voltage & Current Displays */}
            <mesh position={[-0.15, 0.06, 0.18]}>
              <planeGeometry args={[0.32, 0.1]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.18, 0.06, 0.18]}>
              <planeGeometry args={[0.28, 0.1]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            {/* Output Binding Posts */}
            <mesh position={[-0.2, -0.1, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0.0, -0.1, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
              <meshStandardMaterial color="#16a34a" />
            </mesh>
            <mesh position={[0.2, -0.1, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>

          {/* Component Storage Bins on Shelf */}
          <group position={[1.0, 0.15, 0]}>
            {[-0.5, -0.2, 0.1, 0.4].map((bx, bi) => (
              <mesh key={bi} position={[bx, 0, 0]}>
                <boxGeometry args={[0.24, 0.2, 0.3]} />
                <meshStandardMaterial
                  color={['#0284c7', '#ea580c', '#16a34a', '#7c3aed'][bi]}
                  roughness={0.7}
                />
              </mesh>
            ))}
          </group>
        </group>
      </InteractiveObject>

      {/* 3. Digital Storage Oscilloscope (Stage 1 Centerpiece) */}
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
          <boxGeometry args={[0.95, 0.65, 0.45]} />
          <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Screen Bezel */}
        <mesh position={[-0.12, 0.05, 0.23]}>
          <boxGeometry args={[0.68, 0.48, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* CRT/LCD Phosphor Display */}
        <mesh position={[-0.12, 0.05, 0.245]}>
          <planeGeometry args={[0.62, 0.42]} />
          <meshBasicMaterial color="#022c22" />
        </mesh>
        {/* Graticule Grid Lines (8x10 divisions) */}
        <gridHelper
          args={[0.6, 10, '#065f46', '#064e3b']}
          position={[-0.12, 0.05, 0.248]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Real-time Waveform Line */}
        <primitive object={lineObject} ref={waveRef} position={[-0.12, 0.05, 0.252]} />
        {/* Frequency & Voltage Badge */}
        <mesh position={[-0.28, 0.22, 0.25]}>
          <planeGeometry args={[0.22, 0.04]} />
          <meshBasicMaterial color="#166534" />
        </mesh>
        {/* Channel 1 Active LED */}
        <mesh ref={probeLedRef} position={[-0.4, 0.22, 0.25]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#22c55e" transparent />
        </mesh>
        {/* Knobs & BNC Inputs */}
        <mesh position={[0.3, 0.15, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[0.3, 0.0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[0.3, -0.15, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
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
          <boxGeometry args={[0.85, 0.52, 0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Numerical VFD Display */}
        <mesh position={[-0.12, 0.08, 0.21]}>
          <planeGeometry args={[0.48, 0.2]} />
          <meshBasicMaterial color="#0369a1" />
        </mesh>
        {/* Power LED Indicator */}
        <mesh position={[0.28, 0.15, 0.21]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Output BNC Jack */}
        <mesh position={[0.25, -0.1, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
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
        {/* White Breadboard Solderless Chassis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.85, 0.03, 0.42]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        {/* Power Rail Stripes (Red/Blue) */}
        <mesh position={[0, 0.016, -0.19]}>
          <planeGeometry args={[0.8, 0.01]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 0.016, 0.19]}>
          <planeGeometry args={[0.8, 0.01]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        {/* IC DIP-8 Op-Amp Chip */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        {/* Electrolytic Capacitor */}
        <mesh position={[-0.2, 0.05, -0.05]}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 12]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} />
        </mesh>
        {/* Metal Film Resistor */}
        <mesh position={[0.18, 0.025, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#b45309" roughness={0.4} />
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
        {/* Enclosure */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.72, 0.45, 0.18]} />
          <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Status Mode LED */}
        <mesh position={[0, 0.12, 0.1]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={isStage3Done ? '#22c55e' : '#f59e0b'} />
        </mesh>
        {/* Filter Topology Label Backing */}
        <mesh position={[0, -0.06, 0.1]}>
          <planeGeometry args={[0.55, 0.2]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </InteractiveObject>

      {/* 7. Main Instrumentation ATE Console (Stage 4) */}
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
          <boxGeometry args={[0.85, 1.5, 0.65]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Angled Touchscreen Bezel */}
        <mesh position={[0, 0.15, 0]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.95, 0.65, 0.08]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Glowing Screen Content */}
        <mesh position={[0, 0.16, 0.05]} rotation={[-0.4, 0, 0]}>
          <planeGeometry args={[0.85, 0.55]} />
          <meshBasicMaterial color={isStage4Done ? '#15803d' : '#0369a1'} />
        </mesh>
      </InteractiveObject>

      {/* 8. Diagnostic Hint Buzzer on Workbench */}
      <HintBuzzer
        id="hint_buzzer"
        name="Diagnostic Hint Buzzer"
        position={[1.8, 0.92, -2.9]}
        rotation={[0, -Math.PI / 4, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 9. Component Storage Cabinet */}
      <LockedCabinet
        id="cabinet_02"
        name="Precision Parts Locker"
        isUnlocked={unlockedObjects.includes('cabinet_02') || isStage2Done}
        position={[-4.5, 1.5, -1.0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 10. Laboratory Exit Door */}
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
