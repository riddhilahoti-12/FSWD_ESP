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

/**
 * SignalLabScene - Mission 2: Signal in the Lab
 * Bright Futuristic Educational Electronics & Signal-Processing Laboratory
 * 
 * Aesthetic tokens:
 * - Main Walls: #D9E1E8 (Light Cool Gray)
 * - Secondary Walls: #C5D0DA (Soft Gray)
 * - Main Floor: #9FAFBC (Medium Cool Gray)
 * - Floor Panels: #8799A8 (Light Slate Gray)
 * - Structural Metal: #B8C4CE (Silver Gray)
 * - Tech Accents: #00BFEF (Bright Cyan) & #3B82F6 (Sky Blue) & #8B6FF7 (Soft Violet)
 * - Lighting: Ambient #FFFFFF (1.35) + key fills (no dark corners)
 */
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
        // High frequency noise spikes (> 5 kHz) active until Stage 3 filter is latched
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
      new THREE.LineBasicMaterial({ color: '#22c55e', linewidth: 3 })
    );
  }, [waveGeometry]);

  return (
    <group name="SignalLabScene">
      {/* ==================================================== */}
      {/* 1. BRIGHT FUTURISTIC LIGHTING & AMBIANCE             */}
      {/* ==================================================== */}
      <ambientLight intensity={1.35} color="#ffffff" />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.2}
        color="#f8fafc"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-4, 7, -3]}
        intensity={0.9}
        color="#e0f2fe"
      />
      {/* Focused Workbench Task Downlights */}
      <pointLight position={[0, 3.2, -3.5]} intensity={1.8} distance={8} color="#e0f2fe" />
      <pointLight position={[3.5, 3.0, -2.0]} intensity={1.4} distance={6} color="#00bfeF" />

      {/* Floating subtle technical particulate */}
      <EnvironmentEffects />

      {/* ==================================================== */}
      {/* 2. BRIGHT LABORATORY STRUCTURAL SHELL                */}
      {/* ==================================================== */}
      {/* Main Floor - Medium Cool Gray (#9FAFBC) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#9FAFBC" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Walkway ESD Accent Panels - Light Slate Gray (#8799A8) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[4.2, 17.6]} />
        <meshStandardMaterial color="#8799A8" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Subtle Technical Floor Grid */}
      <gridHelper
        args={[18, 18, '#00BFEF', '#B8C4CE']}
        position={[0, 0.01, 0]}
      />

      {/* Ceiling - Clean Off-White / Soft Light Gray (#E8EEF4) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#E8EEF4" roughness={0.9} />
      </mesh>

      {/* North Wall (Back) - Light Cool Gray (#D9E1E8) */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#D9E1E8" roughness={0.65} />
      </mesh>
      {/* Recessed Wall Panels (#C5D0DA) */}
      <mesh position={[-3.5, 2.75, -8.98]}>
        <planeGeometry args={[4.5, 4.0]} />
        <meshStandardMaterial color="#C5D0DA" roughness={0.6} />
      </mesh>
      <mesh position={[3.5, 2.75, -8.98]}>
        <planeGeometry args={[4.5, 4.0]} />
        <meshStandardMaterial color="#C5D0DA" roughness={0.6} />
      </mesh>
      {/* Technical Trim Stripes (Bright Cyan & Soft Violet) */}
      <mesh position={[0, 2.5, -8.96]}>
        <planeGeometry args={[14, 0.06]} />
        <meshBasicMaterial color="#00BFEF" />
      </mesh>
      <mesh position={[0, 2.38, -8.96]}>
        <planeGeometry args={[14, 0.03]} />
        <meshBasicMaterial color="#8B6FF7" />
      </mesh>

      {/* South Wall (Front / Entrance) - Light Cool Gray (#D9E1E8) */}
      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#D9E1E8" roughness={0.65} />
      </mesh>
      <mesh position={[0, 2.5, 8.98]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 0.06]} />
        <meshBasicMaterial color="#00BFEF" />
      </mesh>

      {/* West Wall (Left) - Light Cool Gray (#D9E1E8) */}
      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#D9E1E8" roughness={0.65} />
      </mesh>
      <mesh position={[-6.98, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.06]} />
        <meshBasicMaterial color="#00BFEF" />
      </mesh>

      {/* East Wall (Right) - Light Cool Gray (#D9E1E8) */}
      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#D9E1E8" roughness={0.65} />
      </mesh>
      <mesh position={[6.98, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.06]} />
        <meshBasicMaterial color="#00BFEF" />
      </mesh>

      {/* Structural Silver Gray Columns (#B8C4CE) */}
      {[
        [-6.85, 0, -8.85],
        [6.85, 0, -8.85],
        [-6.85, 0, 8.85],
        [6.85, 0, 8.85],
        [-6.85, 0, 0],
        [6.85, 0, 0],
      ].map(([x, , z], idx) => (
        <group key={idx} position={[x, 2.75, z]}>
          <mesh>
            <boxGeometry args={[0.42, 5.5, 0.42]} />
            <meshStandardMaterial color="#B8C4CE" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.44, 5.5, 0.05]} />
            <meshBasicMaterial color="#00BFEF" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Baseboards - Silver Gray (#B8C4CE) */}
      <mesh position={[0, 0.15, -8.96]}>
        <boxGeometry args={[14, 0.3, 0.06]} />
        <meshStandardMaterial color="#B8C4CE" metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.15, 8.96]}>
        <boxGeometry args={[14, 0.3, 0.06]} />
        <meshStandardMaterial color="#B8C4CE" metalness={0.6} />
      </mesh>
      <mesh position={[-6.96, 0.15, 0]}>
        <boxGeometry args={[0.06, 0.3, 18]} />
        <meshStandardMaterial color="#B8C4CE" metalness={0.6} />
      </mesh>
      <mesh position={[6.96, 0.15, 0]}>
        <boxGeometry args={[0.06, 0.3, 18]} />
        <meshStandardMaterial color="#B8C4CE" metalness={0.6} />
      </mesh>

      {/* Overhead Cable Trays & Industrial Conduit */}
      <group position={[0, 4.6, -3.5]}>
        <mesh>
          <boxGeometry args={[12, 0.08, 0.6]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Support Rods */}
        <mesh position={[-4, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.8} />
        </mesh>
        <mesh position={[4, 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.8} />
        </mesh>
        {/* Coax & Signal Cable Bundles (Horizontal rotation) */}
        <mesh position={[0, 0.06, -0.15]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 11.8, 12]} />
          <meshStandardMaterial color="#00BFEF" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.06, 0.15]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 11.8, 12]} />
          <meshStandardMaterial color="#3B82F6" roughness={0.5} />
        </mesh>
      </group>

      {/* Ceiling Bright Diffuser Light Panels */}
      {[
        [-2.5, 5.4, -3.5],
        [2.5, 5.4, -3.5],
        [0, 5.4, 1.5],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[2.4, 0.08, 0.8]} />
            <meshStandardMaterial color="#B8C4CE" metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <planeGeometry args={[2.2, 0.6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* ==================================================== */}
      {/* 3. CENTRAL ELECTRONICS ESD WORKBENCH (STAGES 1 & 2)  */}
      {/* ==================================================== */}
      <InteractiveObject
        id="workbench"
        name="Electronics Prototyping ESD Workbench"
        position={[0, 0.8, -3.5]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Table Top - Light Slate Gray (#8799A8) */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.1, 1.9]} />
          <meshStandardMaterial color="#8799A8" roughness={0.3} metalness={0.3} />
        </mesh>
        {/* Blue High-Contrast ESD Dissipative Mat (#0284C7) */}
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[4.0, 0.01, 1.5]} />
          <meshStandardMaterial color="#0284C7" roughness={0.7} />
        </mesh>
        {/* Grounding Snap Stud */}
        <mesh position={[-1.9, 0.065, 0.65]}>
          <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.9} />
        </mesh>
        {/* Silver Gray Steel Legs (#B8C4CE) */}
        {[
          [-2.0, -0.4, -0.75],
          [2.0, -0.4, -0.75],
          [-2.0, -0.4, 0.75],
          [2.0, -0.4, 0.75],
        ].map(([lx, ly, lz], idx) => (
          <mesh key={idx} position={[lx, ly, lz]} castShadow>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#B8C4CE" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Overhead Tool & Instrument Shelf */}
        <group position={[0, 0.85, -0.6]}>
          <mesh>
            <boxGeometry args={[4.2, 0.05, 0.45]} />
            <meshStandardMaterial color="#B8C4CE" metalness={0.6} />
          </mesh>
          {/* Silver Support Brackets */}
          <mesh position={[-1.9, -0.4, 0]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#B8C4CE" metalness={0.7} />
          </mesh>
          <mesh position={[1.9, -0.4, 0]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#B8C4CE" metalness={0.7} />
          </mesh>

          {/* Precision DC Laboratory Power Supply on Shelf */}
          <group position={[-1.1, 0.22, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.38, 0.35]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.5} roughness={0.3} />
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
                  color={['#00BFEF', '#3B82F6', '#8B6FF7', '#20B86B'][bi]}
                  roughness={0.6}
                />
              </mesh>
            ))}
          </group>
        </group>
      </InteractiveObject>

      {/* ==================================================== */}
      {/* 4. DIGITAL STORAGE OSCILLOSCOPE (STAGE 1 CENTERPIECE)*/}
      {/* ==================================================== */}
      <InteractiveObject
        id="oscilloscope"
        name="Digital Storage Oscilloscope (DSO 200MHz)"
        position={[-1.2, 1.25, -3.5]}
        rotation={[0, 0.15, 0]}
        isLocked={activeStage?.id !== 'stage-1' && !completedStages.includes(1)}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Chassis - Silver Gray (#B8C4CE) */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.95, 0.65, 0.45]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Screen Bezel */}
        <mesh position={[-0.12, 0.05, 0.23]}>
          <boxGeometry args={[0.68, 0.48, 0.02]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>
        {/* Phosphor Display Screen */}
        <mesh position={[-0.12, 0.05, 0.245]}>
          <planeGeometry args={[0.62, 0.42]} />
          <meshBasicMaterial color="#022C22" />
        </mesh>
        {/* Graticule Grid Lines (8x10 divisions) */}
        <gridHelper
          args={[0.6, 10, '#065F46', '#064E3B']}
          position={[-0.12, 0.05, 0.248]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Real-time Waveform Line */}
        <primitive object={lineObject} ref={waveRef} position={[-0.12, 0.05, 0.252]} />
        {/* Frequency & Voltage Telemetry Banner */}
        <mesh position={[-0.28, 0.22, 0.25]}>
          <planeGeometry args={[0.24, 0.04]} />
          <meshBasicMaterial color="#166534" />
        </mesh>
        {/* Channel 1 Active Pulse LED */}
        <mesh ref={probeLedRef} position={[-0.4, 0.22, 0.25]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#22C55E" transparent />
        </mesh>
        {/* Control Knobs & BNC Inputs */}
        <mesh position={[0.3, 0.15, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} />
        </mesh>
        <mesh position={[0.3, 0.0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} />
        </mesh>
        <mesh position={[0.3, -0.15, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 16]} />
          <meshStandardMaterial color="#00BFEF" metalness={0.9} />
        </mesh>
      </InteractiveObject>

      {/* ==================================================== */}
      {/* 5. ARBITRARY FUNCTION GENERATOR (STAGE 1)            */}
      {/* ==================================================== */}
      <InteractiveObject
        id="signal_generator"
        name="Arbitrary Function Generator (Siglent)"
        position={[1.2, 1.25, -3.5]}
        rotation={[0, -0.15, 0]}
        isLocked={activeStage?.id !== 'stage-1' && !completedStages.includes(1)}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.52, 0.4]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Blue Illuminated VFD Display Screen */}
        <mesh position={[-0.12, 0.08, 0.21]}>
          <planeGeometry args={[0.48, 0.2]} />
          <meshBasicMaterial color="#0284C7" />
        </mesh>
        {/* Status LED Indicator */}
        <mesh position={[0.28, 0.15, 0.21]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="#00BFEF" />
        </mesh>
        {/* Output BNC Jack */}
        <mesh position={[0.25, -0.1, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
        </mesh>
      </InteractiveObject>

      {/* ==================================================== */}
      {/* 6. PROTOTYPING BREADBOARD & RC CIRCUIT (STAGE 2)     */}
      {/* ==================================================== */}
      <InteractiveObject
        id="breadboard"
        name="Prototyping Breadboard & RC Circuit"
        position={[0.0, 0.9, -3.2]}
        isLocked={activeStage?.id !== 'stage-2' && !completedStages.includes(2)}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* White Breadboard Solderless Chassis */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.03, 0.42]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.8} />
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
          <meshStandardMaterial color="#1E293B" roughness={0.3} />
        </mesh>
        {/* Electrolytic Capacitor */}
        <mesh position={[-0.2, 0.05, -0.05]}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 12]} />
          <meshStandardMaterial color="#00BFEF" metalness={0.6} />
        </mesh>
        {/* Metal Film Resistor (10 kΩ) */}
        <mesh position={[0.18, 0.025, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#B45309" roughness={0.4} />
        </mesh>
      </InteractiveObject>

      {/* ==================================================== */}
      {/* 7. ACTIVE OP-AMP FILTER SELECTOR MODULE (STAGE 3)    */}
      {/* ==================================================== */}
      <InteractiveObject
        id="filter_module"
        name="Active Op-Amp Filter Selector Module"
        position={[0.0, 1.45, -3.9]}
        isLocked={activeStage?.id !== 'stage-3' && !completedStages.includes(3)}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Silver Enclosure */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.72, 0.45, 0.18]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Status Mode LED */}
        <mesh position={[0, 0.12, 0.1]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={isStage3Done ? '#20B86B' : '#F59E0B'} />
        </mesh>
        {/* Filter Topology Label Backing */}
        <mesh position={[0, -0.06, 0.1]}>
          <planeGeometry args={[0.55, 0.2]} />
          <meshBasicMaterial color="#1E293B" />
        </mesh>
      </InteractiveObject>

      {/* ==================================================== */}
      {/* 8. MAIN INSTRUMENTATION ATE CONSOLE (STAGE 4)        */}
      {/* ==================================================== */}
      <InteractiveObject
        id="measurement_console"
        name="Main Instrumentation ATE Terminal"
        position={[3.5, 1.5, -2.0]}
        rotation={[0, -Math.PI / 3, 0]}
        isLocked={activeStage?.id !== 'stage-4' && !completedStages.includes(4)}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Console Pillar Base - Silver Gray (#B8C4CE) */}
        <mesh position={[0, -0.75, 0]} castShadow>
          <boxGeometry args={[0.85, 1.5, 0.65]} />
          <meshStandardMaterial color="#B8C4CE" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Angled Touchscreen Bezel */}
        <mesh position={[0, 0.15, 0]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.95, 0.65, 0.08]} />
          <meshStandardMaterial color="#00BFEF" />
        </mesh>
        {/* Glowing Screen Content */}
        <mesh position={[0, 0.16, 0.05]} rotation={[-0.4, 0, 0]}>
          <planeGeometry args={[0.85, 0.55]} />
          <meshBasicMaterial color={isStage4Done ? '#15803D' : '#0284C7'} />
        </mesh>
      </InteractiveObject>

      {/* ==================================================== */}
      {/* 9. DIAGNOSTIC HINT BUZZER ON WORKBENCH               */}
      {/* ==================================================== */}
      <HintBuzzer
        id="hint_buzzer"
        name="Diagnostic Hint Buzzer"
        position={[1.8, 0.92, -2.9]}
        rotation={[0, -Math.PI / 4, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* ==================================================== */}
      {/* 10. COMPONENT STORAGE CABINET                        */}
      {/* ==================================================== */}
      <LockedCabinet
        id="cabinet_02"
        name="Precision Parts Locker"
        isUnlocked={unlockedObjects.includes('cabinet_02') || isStage2Done}
        position={[-4.5, 1.5, -1.0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* ==================================================== */}
      {/* 11. LABORATORY EXIT DOOR                             */}
      {/* ==================================================== */}
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
