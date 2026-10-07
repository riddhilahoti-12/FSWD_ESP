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

export const GreenhouseScene: React.FC<SceneProps> = ({
  missionState,
  onObjectClick,
  onObjectHover,
}) => {
  const { unlockedObjects, completedStages, activeStage, isExitUnlocked } = missionState;

  const isStage2Done = completedStages.includes(2);
  const isStage3Done = completedStages.includes(3);
  const isStage4Done = completedStages.includes(4);

  const fanBladeRef = useRef<THREE.Group>(null);

  // Ventilation fan rotation animation when activated in Stage 3
  useFrame((_, delta) => {
    if (fanBladeRef.current && isStage3Done) {
      fanBladeRef.current.rotation.z += delta * 14;
    }
  });

  return (
    <group>
      {/* 1. Greenhouse Botanical Shell */}
      {/* Soil & Stone Walkway Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#141c14" roughness={0.9} />
      </mesh>

      {/* Center Paver Walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[2.4, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* A-Frame Glass Greenhouse Structure */}
      {/* Back Wall */}
      <mesh position={[0, 2.75, -9]}>
        <planeGeometry args={[14, 5.5]} />
        <meshStandardMaterial color="#064e3b" transparent opacity={0.65} roughness={0.2} />
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
      <mesh position={[7, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5.5]} />
        <meshStandardMaterial color="#022c22" transparent opacity={0.5} roughness={0.1} />
      </mesh>

      {/* Natural & Grow Light Illumination */}
      <ambientLight intensity={0.5} color="#ecfdf5" />
      <directionalLight position={[2, 6, -1]} intensity={0.9} color="#fef08a" />
      <pointLight position={[0, 3.5, -2.8]} intensity={isStage4Done ? 2.5 : 0.8} distance={12} color={isStage4Done ? '#d946ef' : '#10b981'} />

      {/* 2. Vegetative Crop Beds (Stage 1) */}
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
          <boxGeometry args={[1.4, 0.5, 4.0]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        <mesh position={[1.8, 0, 0]}>
          <boxGeometry args={[1.4, 0.5, 4.0]} />
          <meshStandardMaterial color="#451a03" roughness={0.9} />
        </mesh>
        {/* Soil Layers */}
        <mesh position={[-1.8, 0.22, 0]}>
          <boxGeometry args={[1.3, 0.1, 3.8]} />
          <meshStandardMaterial color="#1c1917" roughness={1.0} />
        </mesh>
        <mesh position={[1.8, 0.22, 0]}>
          <boxGeometry args={[1.3, 0.1, 3.8]} />
          <meshStandardMaterial color="#1c1917" roughness={1.0} />
        </mesh>
        {/* Foliage Clusters */}
        <mesh position={[-1.8, 0.38, 0]}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color={isStage2Done ? '#16a34a' : '#65a30d'} roughness={0.8} />
        </mesh>
        <mesh position={[1.8, 0.38, 0]}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color={isStage2Done ? '#16a34a' : '#65a30d'} roughness={0.8} />
        </mesh>
      </InteractiveObject>

      {/* 3. Multi-Spectral Environmental IoT Sensor (Stage 1) */}
      <InteractiveObject
        id="environmental_sensors"
        name="Multi-Spectral IoT Sensor Node"
        position={[-1.8, 1.4, -3.2]}
        rotation={[0, 0.2, 0]}
        isLocked={activeStage?.id !== 'stage-1'}
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
          <boxGeometry args={[0.25, 0.3, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Digital OLED Metric Display */}
        <mesh position={[0, 0.1, 0.105]}>
          <planeGeometry args={[0.18, 0.12]} />
          <meshBasicMaterial color="#047857" />
        </mesh>
      </InteractiveObject>

      {/* 4. Automated Drip Irrigation Manifold (Stage 2) */}
      <InteractiveObject
        id="irrigation_system"
        name="Automated Drip Irrigation Manifold"
        position={[1.8, 0.65, -3.2]}
        rotation={[0, -0.2, 0]}
        isLocked={activeStage?.id !== 'stage-2'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Solenoid Block */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.25, 0.25]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} />
        </mesh>
        {/* Irrigation Distribution Pipes */}
        <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </InteractiveObject>

      {/* 5. Nutrient Water Storage Reservoir (Stage 2) */}
      <InteractiveObject
        id="water_tank"
        name="Nutrient Solution Reservoir"
        position={[3.2, 1.2, -4.0]}
        isLocked={activeStage?.id !== 'stage-2'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Polyethylene Storage Tank */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 1.8, 32]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} roughness={0.3} />
        </mesh>
        {/* Level Float Indicator */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.8, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} />
        </mesh>
      </InteractiveObject>

      {/* 6. Gable Ventilation Exhaust Fan (Stage 3) */}
      <InteractiveObject
        id="ventilation_fan"
        name="Gable Convective Exhaust Fan"
        position={[0.0, 3.2, -4.8]}
        isLocked={activeStage?.id !== 'stage-3'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Outer Circular Shroud */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.2, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Rotating Blades */}
        <group ref={fanBladeRef} position={[0, 0, 0.05]}>
          <mesh>
            <boxGeometry args={[1.2, 0.16, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[1.2, 0.16, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </InteractiveObject>

      {/* 7. Full-Spectrum Horticulture Grow Lights (Stage 4) */}
      <InteractiveObject
        id="grow_lights"
        name="Horticulture LED Grow Lights"
        position={[0.0, 3.2, -2.8]}
        isLocked={activeStage?.id !== 'stage-4'}
        onClick={onObjectClick}
        onHover={onObjectHover}
      >
        {/* Long Suspended Light Bars */}
        <mesh position={[-1.8, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 3.8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[1.8, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 3.8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Emissive LED Emitters */}
        <mesh position={[-1.8, -0.04, 0]}>
          <boxGeometry args={[0.15, 0.01, 3.6]} />
          <meshBasicMaterial color={isStage4Done ? '#e879f9' : '#475569'} />
        </mesh>
        <mesh position={[1.8, -0.04, 0]}>
          <boxGeometry args={[0.15, 0.01, 3.6]} />
          <meshBasicMaterial color={isStage4Done ? '#e879f9' : '#475569'} />
        </mesh>
      </InteractiveObject>

      {/* 8. Master Climate Console (Stage 4) */}
      <InteractiveObject
        id="greenhouse_console"
        name="Master Agro-Tech Climate Console"
        position={[-3.5, 1.4, -1.8]}
        rotation={[0, Math.PI / 3, 0]}
        isLocked={activeStage?.id !== 'stage-4'}
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

      {/* 9. Botanical Supply Cabinet */}
      <LockedCabinet
        id="supply_cabinet"
        name="Agricultural Supplies Locker"
        isUnlocked={unlockedObjects.includes('supply_cabinet') || isStage2Done}
        position={[-4.5, 1.5, 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* 10. Facility Exit Door */}
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
