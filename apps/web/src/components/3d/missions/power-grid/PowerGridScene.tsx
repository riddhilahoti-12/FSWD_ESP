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

export const PowerGridScene: React.FC<SceneProps> = ({
  missionState,
  onObjectClick,
  onObjectHover,
}) => {
  const { unlockedObjects, completedStages, activeStage, isExitUnlocked } = missionState;

  const isStage2Done = completedStages.includes(2);
  const isStage3Done = completedStages.includes(3);
  const isStage4Done = completedStages.includes(4);

  const pwmIndicatorRef = useRef<THREE.Mesh>(null);
  const busbarGlowRef = useRef<THREE.Mesh>(null);

  // Microgrid voltage PWM ripple animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 12;
    if (pwmIndicatorRef.current) {
      const intensity = 0.5 + Math.sin(t) * 0.4;
      (pwmIndicatorRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
    if (busbarGlowRef.current) {
      const pulse = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      (busbarGlowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  return (
    <group name="PowerGridScene">
      {/* 1. Power Lab Room Shell */}
      {/* Floor - Heavy Industrial Epoxy Tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#0b1320" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Industrial Safety Grid */}
      <gridHelper
        args={[18, 18, '#f59e0b', '#1e293b']}
        position={[0, 0.01, 0]}
      />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#080c14" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      {/* Yellow/Amber Electrical Warning Trim Stripe */}
      <mesh position={[0, 2.4, -8.98]}>
        <planeGeometry args={[14, 0.08]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 2.25, -8.98]}>
        <planeGeometry args={[14, 0.03]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
      </mesh>

      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>

      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      <mesh position={[-6.98, 2.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
      </mesh>

      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      <mesh position={[6.98, 2.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
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
            <boxGeometry args={[0.5, 5.5, 0.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.52, 5.5, 0.06]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Overhead Copper Busbars & Heavy Cable Conduits */}
      <group position={[0, 4.6, -3.5]}>
        <mesh>
          <boxGeometry args={[12, 0.1, 0.7]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Support Steel Rods */}
        <mesh position={[-4, 0.45, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
        <mesh position={[4, 0.45, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
        {/* Glowing Copper Busbar Conductors */}
        <mesh position={[0, 0.08, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 11.8, 12]} />
          <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.08, 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 11.8, 12]} />
          <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={busbarGlowRef} position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 11.8, 12]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Ceiling High-Bay Fixtures */}
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
            <meshBasicMaterial color="#fed7aa" />
          </mesh>
          <pointLight position={[0, -0.2, 0]} intensity={1.2} distance={8} color="#fef3c7" />
        </group>
      ))}

      {/* Lighting - Amber & Emerald Contrast */}
      <ambientLight intensity={0.35} color="#fed7aa" />
      <directionalLight position={[0, 5, -2]} intensity={0.7} color="#fff7ed" />
      <pointLight position={[0, 3, -3.5]} intensity={1.5} distance={8} color="#f59e0b" />
      <pointLight position={[3.5, 3, -2]} intensity={1.1} distance={7} color="#10b981" />

      {/* Atmospheric Dust Particulate */}
      <EnvironmentEffects />

      {/* 2. Heavy Power Test Bench */}
      <group position={[0, 0.8, -3.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.6, 0.12, 1.9]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Rubber Non-conductive Top Inset */}
        <mesh position={[0, 0.065, 0]}>
          <boxGeometry args={[4.2, 0.01, 1.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Legs */}
        {[
          [-2.1, -0.42, -0.75],
          [2.1, -0.42, -0.75],
          [-2.1, -0.42, 0.75],
          [2.1, -0.42, 0.75],
        ].map(([lx, ly, lz], idx) => (
          <mesh key={idx} position={[lx, ly, lz]}>
            <boxGeometry args={[0.12, 0.84, 0.12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* 3. Triple Output DC Precision Power Supply (Stage 1) */}
      <InteractiveObject
        id="dc_supply"
        name="Precision Low-Voltage DC Supply"
        position={[-1.3, 1.25, -3.6]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.95, 0.65, 0.52]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Dual LED Voltage & Current Digital Meters */}
        <mesh position={[-0.2, 0.1, 0.27]}>
          <planeGeometry args={[0.32, 0.15]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.2, 0.1, 0.27]}>
          <planeGeometry args={[0.32, 0.15]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        {/* 3.3V Output Terminals */}
        <mesh position={[-0.2, -0.12, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.2, -0.12, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </InteractiveObject>

      {/* 4. 12-Bit Analog Quantizer Submodule (Stage 1 Centerpiece) */}
      <InteractiveObject
        id="adc_module"
        name="12-Bit Analog Quantizer Submodule"
        position={[0.0, 1.15, -3.3]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.26, 0.42]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Display Screen */}
        <mesh position={[0, 0.135, 0]}>
          <planeGeometry args={[0.55, 0.28]} />
          <meshBasicMaterial color="#082f49" />
        </mesh>
        {/* ADC IC Chip */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.15, 0.02, 0.1]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </InteractiveObject>

      {/* 5. Digital Bus Voltmeter (Stage 1) */}
      <InteractiveObject
        id="voltage_display"
        name="Digital Bus Voltmeter"
        position={[1.3, 1.3, -3.6]}
        rotation={[0, -0.15, 0]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.85, 0.52, 0.38]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} />
        </mesh>
        {/* 7-Segment Digital Readout Frame */}
        <mesh position={[0, 0.05, 0.2]}>
          <planeGeometry args={[0.65, 0.24]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </InteractiveObject>

      {/* 6. PWM Buck Converter Stage (Stage 2) */}
      <InteractiveObject
        id="pwm_controller"
        name="PWM Buck Converter Stage"
        position={[0.0, 1.35, -3.9]}
        isLocked={activeStage?.id !== 'stage-2'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.85, 0.48, 0.32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Pulsing Duty Cycle Indicator */}
        <mesh ref={pwmIndicatorRef} position={[0, 0.12, 0.17]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial
            color={isStage2Done ? '#22c55e' : '#f59e0b'}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Toroidal Inductor Core */}
        <mesh position={[-0.2, 0.0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.03, 12, 24]} />
          <meshStandardMaterial color="#b45309" metalness={0.8} />
        </mesh>
      </InteractiveObject>

      {/* 7. Precision Resistive Load Bank (Stage 3) */}
      <InteractiveObject
        id="load_bank"
        name="Precision Resistive Load Bank"
        position={[-2.8, 0.95, -2.5]}
        rotation={[0, Math.PI / 4, 0]}
        isLocked={activeStage?.id !== 'stage-3'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Aluminum Heatsink Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.95, 0.42, 0.65]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Wirewound Ceramic Resistor Bars */}
        <mesh position={[0, 0.26, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.085, 0.085, 0.75, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
      </InteractiveObject>

      {/* 8. Thermal & Current Diagnostic Bay (Stage 3) */}
      <InteractiveObject
        id="calibration_panel"
        name="Thermal & Current Diagnostic Bay"
        position={[-2.8, 1.6, -2.5]}
        rotation={[0, Math.PI / 4, 0]}
        isLocked={activeStage?.id !== 'stage-3'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.65, 0.38, 0.08]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.55, 0.28]} />
          <meshBasicMaterial color={isStage3Done ? '#064e3b' : '#78350f'} />
        </mesh>
      </InteractiveObject>

      {/* 9. Master Microgrid Controller Console (Stage 4) */}
      <InteractiveObject
        id="power_console"
        name="Master Microgrid Controller"
        position={[3.5, 1.5, -2.0]}
        rotation={[0, -Math.PI / 3, 0]}
        isLocked={activeStage?.id !== 'stage-4'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.85, 1.4, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.9, 0.55, 0.08]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
        <mesh position={[0, 0.16, 0.05]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.8, 0.45]} />
          <meshBasicMaterial color={isStage4Done ? '#10b981' : '#0e7490'} />
        </mesh>
      </InteractiveObject>

      {/* 10. Diagnostic Hint Buzzer on Power Bench */}
      <HintBuzzer
        id="hint_buzzer"
        name="Diagnostic Hint Buzzer"
        position={[1.8, 0.95, -2.8]}
        rotation={[0, -Math.PI / 4, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 11. Standards Cabinet */}
      <LockedCabinet
        id="cabinet_04"
        name="Calibration Standards Locker"
        isUnlocked={unlockedObjects.includes('cabinet_04') || isStage2Done}
        position={[-4.5, 1.5, 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 12. Laboratory Exit Door */}
      <ExitDoor
        id="exit_door"
        name="Power Lab Exit Portal"
        isOpen={isExitUnlocked}
        position={[4.5, 1.5, 0.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />
    </group>
  );
};
