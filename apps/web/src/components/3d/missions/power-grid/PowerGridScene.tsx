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

  // Microgrid voltage PWM ripple animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 12;
    if (pwmIndicatorRef.current) {
      const intensity = 0.5 + Math.sin(t) * 0.4;
      (pwmIndicatorRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
  });

  return (
    <group>
      {/* 1. Power Lab Room Shell */}
      {/* Floor - Heavy Industrial Epoxy Tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#182234" roughness={0.6} />
      </mesh>
      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#182234" roughness={0.6} />
      </mesh>

      {/* Lighting - Amber & Cool White Contrast */}
      <ambientLight intensity={0.35} color="#fed7aa" />
      <directionalLight position={[0, 5, -2]} intensity={0.7} color="#fff7ed" />
      <pointLight position={[0, 3, -3.5]} intensity={1.3} distance={8} color="#f59e0b" />
      <pointLight position={[3.5, 3, -2]} intensity={1.0} distance={7} color="#10b981" />

      {/* 2. Heavy Power Bench */}
      <group position={[0, 0.8, -3.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.4, 0.12, 1.8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Legs */}
        <mesh position={[-2.0, -0.42, -0.7]}>
          <boxGeometry args={[0.12, 0.84, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[2.0, -0.42, -0.7]}>
          <boxGeometry args={[0.12, 0.84, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[-2.0, -0.42, 0.7]}>
          <boxGeometry args={[0.12, 0.84, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[2.0, -0.42, 0.7]}>
          <boxGeometry args={[0.12, 0.84, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
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
          <boxGeometry args={[0.9, 0.6, 0.5]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Dual LED Voltage Meters */}
        <mesh position={[-0.2, 0.1, 0.26]}>
          <planeGeometry args={[0.3, 0.14]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.2, 0.1, 0.26]}>
          <planeGeometry args={[0.3, 0.14]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </InteractiveObject>

      {/* 4. 12-Bit Analog Quantizer Submodule (Stage 1) */}
      <InteractiveObject
        id="adc_module"
        name="12-Bit Analog Quantizer Submodule"
        position={[0.0, 1.15, -3.3]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.65, 0.25, 0.4]} />
          <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <planeGeometry args={[0.5, 0.25]} />
          <meshBasicMaterial color="#082f49" />
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
          <boxGeometry args={[0.8, 0.5, 0.35]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} />
        </mesh>
        {/* 7-Segment Digital Readout Frame */}
        <mesh position={[0, 0.05, 0.18]}>
          <planeGeometry args={[0.6, 0.22]} />
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
          <boxGeometry args={[0.8, 0.45, 0.3]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Pulsing Duty Cycle Indicator */}
        <mesh ref={pwmIndicatorRef} position={[0, 0.12, 0.16]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color={isStage2Done ? '#22c55e' : '#f59e0b'} transparent opacity={0.8} />
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
          <boxGeometry args={[0.9, 0.4, 0.6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Wirewound Ceramic Resistor Bars */}
        <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 16]} />
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
          <boxGeometry args={[0.6, 0.35, 0.08]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.5, 0.25]} />
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

      {/* 10. Standards Cabinet */}
      <LockedCabinet
        id="cabinet_04"
        name="Calibration Standards Locker"
        isUnlocked={unlockedObjects.includes('cabinet_04') || isStage2Done}
        position={[-4.5, 1.5, 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 11. Laboratory Exit Door */}
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
