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

export const GreenhouseScene: React.FC<SceneProps> = ({
  missionState,
  onObjectClick,
  onObjectHover,
}) => {
  const { unlockedObjects, completedStages, activeStage, isExitUnlocked } = missionState;

  const isStage1Done = completedStages.includes(1);
  const isStage2Done = completedStages.includes(2);
  const isStage3Done = completedStages.includes(3);
  const isStage4Done = completedStages.includes(4);

  const fanBladeRef = useRef<THREE.Group>(null);
  const waterFlowRef = useRef<THREE.Mesh>(null);

  // Ventilation fan rotation and irrigation water flow animations
  useFrame((_, delta) => {
    if (fanBladeRef.current && isStage3Done) {
      fanBladeRef.current.rotation.z += delta * 16;
    }
    if (waterFlowRef.current && isStage2Done) {
      const pulse = 0.5 + Math.sin(delta * 20) * 0.3;
      (waterFlowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  return (
    <group name="GreenhouseScene">
      {/* 1. Greenhouse Botanical Shell */}
      {/* Soil & Stone Walkway Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#0f1f14" roughness={0.9} />
      </mesh>

      {/* Center Paver Walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[2.6, 17]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Walkway Grid Line Pattern */}
      <gridHelper
        args={[18, 18, '#10b981', '#064e3b']}
        position={[0, 0.015, 0]}
      />

      {/* A-Frame Glass Greenhouse Structure */}
      {/* Back Wall */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#064e3b" transparent opacity={0.65} roughness={0.2} />
      </mesh>
      {/* Technical Trim Stripe */}
      <mesh position={[0, 2.4, -8.98]}>
        <planeGeometry args={[14, 0.08]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, 2.75, 9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#064e3b" transparent opacity={0.65} roughness={0.2} />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-7, 2.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#022c22" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[-6.98, 2.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
      </mesh>

      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#022c22" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[6.98, 2.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 0.08]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
      </mesh>

      {/* Steel A-Frame Arch Structural Trusses */}
      {[-6, -2, 2, 6].map((tz, ti) => (
        <group key={ti} position={[0, 2.75, tz]}>
          <mesh position={[-6.8, 0, 0]}>
            <boxGeometry args={[0.2, 5.5, 0.2]} />
            <meshStandardMaterial color="#065f46" metalness={0.6} />
          </mesh>
          <mesh position={[6.8, 0, 0]}>
            <boxGeometry args={[0.2, 5.5, 0.2]} />
            <meshStandardMaterial color="#065f46" metalness={0.6} />
          </mesh>
          <mesh position={[0, 2.65, 0]}>
            <boxGeometry args={[13.8, 0.15, 0.15]} />
            <meshStandardMaterial color="#065f46" metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Natural & Grow Light Illumination */}
      <ambientLight intensity={0.55} color="#ecfdf5" />
      <directionalLight position={[2, 6, -1]} intensity={0.9} color="#fef08a" />
      <pointLight
        position={[0, 3.5, -2.8]}
        intensity={isStage4Done ? 2.5 : 0.9}
        distance={12}
        color={isStage4Done ? '#d946ef' : '#10b981'}
      />

      {/* Atmospheric Pollen & Moisture Motes */}
      <EnvironmentEffects />

      {/* 2. Vegetative Crop Beds (Stage 1 Centerpiece) */}
      <InteractiveObject
        id="plant_beds"
        name="Hydroponic Crop Beds"
        position={[0.0, 0.45, -2.8]}
        isLocked={activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Raised Wooden Planter Troughs */}
        <mesh position={[-1.8, 0, 0]}>
          <boxGeometry args={[1.5, 0.52, 4.2]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        <mesh position={[1.8, 0, 0]}>
          <boxGeometry args={[1.5, 0.52, 4.2]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        {/* Soil Layers */}
        <mesh position={[-1.8, 0.24, 0]}>
          <boxGeometry args={[1.4, 0.1, 4.0]} />
          <meshStandardMaterial color="#1c1917" roughness={1.0} />
        </mesh>
        <mesh position={[1.8, 0.24, 0]}>
          <boxGeometry args={[1.4, 0.1, 4.0]} />
          <meshStandardMaterial color="#1c1917" roughness={1.0} />
        </mesh>

        {/* Foliage Clusters */}
        {[-1.2, -0.4, 0.4, 1.2].map((pz, pi) => (
          <group key={pi}>
            <mesh position={[-1.8, 0.42, pz]}>
              <sphereGeometry args={[0.38, 12, 12]} />
              <meshStandardMaterial
                color={isStage2Done ? '#16a34a' : '#65a30d'}
                roughness={0.7}
              />
            </mesh>
            <mesh position={[1.8, 0.42, pz]}>
              <sphereGeometry args={[0.38, 12, 12]} />
              <meshStandardMaterial
                color={isStage2Done ? '#16a34a' : '#65a30d'}
                roughness={0.7}
              />
            </mesh>
          </group>
        ))}
      </InteractiveObject>

      {/* 3. Multi-Spectral Environmental IoT Sensor (Stage 1) */}
      <InteractiveObject
        id="environmental_sensors"
        name="Multi-Spectral IoT Sensor Node"
        position={[-1.8, 1.4, -3.2]}
        rotation={[0, 0.2, 0]}
        isLocked={!isStage1Done && activeStage?.id !== 'stage-1'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Mast */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        {/* Sensor Pod */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.26, 0.32, 0.22]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Digital OLED Metric Display showing 31% Moisture */}
        <mesh position={[0, 0.1, 0.115]}>
          <planeGeometry args={[0.2, 0.14]} />
          <meshBasicMaterial color="#047857" />
        </mesh>
      </InteractiveObject>

      {/* 4. Automated Drip Irrigation Manifold (Stage 2) */}
      <InteractiveObject
        id="irrigation_system"
        name="Automated Drip Irrigation Manifold"
        position={[1.8, 0.65, -3.2]}
        rotation={[0, -0.2, 0]}
        isLocked={!isStage2Done && activeStage?.id !== 'stage-2'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Solenoid Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.26, 0.26]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} />
        </mesh>
        {/* Irrigation Distribution Pipes */}
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.7, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Animated Flow Water Indicator */}
        <mesh ref={waterFlowRef} position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.048, 0.048, 0.65, 8]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={isStage2Done ? 0.7 : 0.1} />
        </mesh>
      </InteractiveObject>

      {/* 5. Nutrient Water Storage Reservoir (Stage 2) */}
      <InteractiveObject
        id="water_tank"
        name="Nutrient Solution Reservoir"
        position={[3.2, 1.2, -4.0]}
        isLocked={!isStage2Done && activeStage?.id !== 'stage-2'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Polyethylene Storage Tank */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 1.85, 32]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} roughness={0.3} />
        </mesh>
        {/* Level Float Indicator */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.82, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} />
        </mesh>
      </InteractiveObject>

      {/* 6. Gable Ventilation Exhaust Fan (Stage 3) */}
      <InteractiveObject
        id="ventilation_fan"
        name="Gable Convective Exhaust Fan"
        position={[0.0, 3.2, -4.8]}
        rotation={[0, 0, 0]}
        isLocked={!isStage3Done && activeStage?.id !== 'stage-3'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Outer Circular Shroud */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 0.22, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Rotating Blades */}
        <group ref={fanBladeRef} position={[0, 0, 0.05]}>
          <mesh>
            <boxGeometry args={[1.3, 0.18, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[1.3, 0.18, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </InteractiveObject>

      {/* 7. Full-Spectrum Horticulture Grow Lights (Stage 4) */}
      <InteractiveObject
        id="grow_lights"
        name="Horticulture LED Grow Lights"
        position={[0.0, 3.2, -2.8]}
        isLocked={!isStage4Done && activeStage?.id !== 'stage-4'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Long Suspended Light Bars */}
        <mesh position={[-1.8, 0, 0]}>
          <boxGeometry args={[0.22, 0.06, 3.9]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[1.8, 0, 0]}>
          <boxGeometry args={[0.22, 0.06, 3.9]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Emissive LED Emitters */}
        <mesh position={[-1.8, -0.04, 0]}>
          <boxGeometry args={[0.16, 0.01, 3.7]} />
          <meshBasicMaterial color={isStage4Done ? '#e879f9' : '#475569'} />
        </mesh>
        <mesh position={[1.8, -0.04, 0]}>
          <boxGeometry args={[0.16, 0.01, 3.7]} />
          <meshBasicMaterial color={isStage4Done ? '#e879f9' : '#475569'} />
        </mesh>
      </InteractiveObject>

      {/* 8. Master Climate Console (Stage 4) */}
      <InteractiveObject
        id="greenhouse_console"
        name="Master Agro-Tech Climate Console"
        position={[-3.5, 1.4, -1.8]}
        rotation={[0, Math.PI / 3, 0]}
        isLocked={!isStage4Done && activeStage?.id !== 'stage-4'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.85, 1.4, 0.6]} />
          <meshStandardMaterial color="#064e3b" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.9, 0.55, 0.08]} />
          <meshStandardMaterial color="#022c22" />
        </mesh>
        <mesh position={[0, 0.16, 0.05]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.8, 0.45]} />
          <meshBasicMaterial color={isStage4Done ? '#22c55e' : '#047857'} />
        </mesh>
      </InteractiveObject>

      {/* 9. Diagnostic Hint Buzzer on Walkway Pedestal */}
      <HintBuzzer
        id="hint_buzzer"
        name="Diagnostic Hint Buzzer"
        position={[2.0, 0.95, -2.1]}
        rotation={[0, -Math.PI / 4, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 10. Botanical Supply Cabinet */}
      <LockedCabinet
        id="supply_cabinet"
        name="Agricultural Supplies Locker"
        isUnlocked={unlockedObjects.includes('supply_cabinet') || isStage2Done}
        position={[-4.5, 1.5, 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 11. Facility Exit Door */}
      <ExitDoor
        id="exit_door"
        name="Botanical Facility Air-Lock Exit"
        isOpen={isExitUnlocked}
        position={[4.5, 1.5, 0.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />
    </group>
  );
};
