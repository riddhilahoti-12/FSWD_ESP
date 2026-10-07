'use client';

import React from 'react';
import { MissionState } from '@missionx/shared';
import ServerRoomShell from './ServerRoomShell';
import CableTrays from './CableTrays';
import RoomLighting from './RoomLighting';
import { EnvironmentEffects } from './EnvironmentEffects';
import { ServerRack } from '../Objects/ServerRack';
import { TemperatureSensor } from '../Objects/TemperatureSensor';
import { HumiditySensor } from '../Objects/HumiditySensor';
import { CoolingFan } from '../Objects/CoolingFan';
import { WarningBeacon } from '../Objects/WarningBeacon';
import { AlarmBuzzer } from '../Objects/AlarmBuzzer';
import { WaterSensor } from '../Objects/WaterSensor';
import { DrainageTray } from '../Objects/DrainageTray';
import { ControlPanel } from '../Objects/ControlPanel';
import { LockedCabinet } from '../Objects/LockedCabinet';
import { ExitDoor } from '../Objects/ExitDoor';

interface MissionRoomProps {
  missionState: MissionState;
  onObjectClick: (objectId: string) => void;
  onObjectHover: (objectId: string | null, name: string | null, isLocked: boolean) => void;
}

export const MissionRoom: React.FC<MissionRoomProps> = ({
  missionState,
  onObjectClick,
  onObjectHover,
}) => {
  const { unlockedObjects, completedStages, activeStage, isExitUnlocked } = missionState;

  // Determine dynamic object states derived strictly from authoritative missionState
  const isFanRestored = completedStages.includes(4);
  const isEmergencyActive = !completedStages.includes(4);
  const currentStageOrder = activeStage?.order ?? 1;
  const warningLedState = isFanRestored ? 'OFF' : currentStageOrder >= 2 ? 'ACTIVE' : 'WARNING';
  const isCabinetUnlocked = unlockedObjects.includes('cabinet_01');
  const isControlPanelUnlocked = unlockedObjects.includes('control_panel');

  return (
    <group>
      {/* 1. Structural Datacenter Room Shell (Floor, Walls, Ceiling, Columns) */}
      <ServerRoomShell />

      {/* 2. Cable Ladders & Fiber Trays Suspended from Ceiling */}
      <CableTrays />

      {/* 3. Server Room Lighting System (Fluorescents, Ambient, Alarm point lights) */}
      <RoomLighting isWarningActive={isEmergencyActive} isEmergencyActive={isEmergencyActive} />

      {/* 4. Atmospheric HVAC Air Motes */}
      <EnvironmentEffects />

      {/* 5. Datacenter Server Racks (Cold & Hot Aisle Setup) */}
      {/* Row A: Left Side */}
      <ServerRack position={[-4.5, 0, -5.0]} />
      <ServerRack position={[-4.5, 0, -3.8]} />
      <ServerRack position={[-4.5, 0, -2.6]} />
      <ServerRack position={[-4.5, 0, -1.4]} />
      <ServerRack position={[-4.5, 0, -0.2]} />
      <ServerRack position={[-4.5, 0, 1.0]} />
      <ServerRack position={[-4.5, 0, 2.2]} />

      {/* Row B: Right Side */}
      <ServerRack position={[4.0, 0, -5.0]} rotation={[0, Math.PI, 0]} />
      <ServerRack position={[4.0, 0, -1.4]} rotation={[0, Math.PI, 0]} />
      <ServerRack position={[4.0, 0, 1.0]} rotation={[0, Math.PI, 0]} />
      <ServerRack position={[4.0, 0, 2.2]} rotation={[0, Math.PI, 0]} />

      {/* 6. Authoritative Mission Equipment Objects Registered to Engine IDs */}

      {/* Temperature Sensor (Stage 1) */}
      <TemperatureSensor
        id="temperature_sensor"
        name="Ambient Temperature Sensor"
        isLocked={activeStage?.id !== 'stage-1'}
        position={[2.5, 1.8, -3.0]}
        reading="31.8°C"
        isAlert={isEmergencyActive}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Humidity Sensor (Stage 1) */}
      <HumiditySensor
        id="humidity_sensor"
        name="Ambient Humidity Probe"
        isLocked={activeStage?.id !== 'stage-1'}
        position={[2.8, 1.8, -3.0]}
        reading="68.0%"
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* CRAC Cooling Fan Unit (Stage 2) */}
      <CoolingFan
        id="cooling_fan"
        name="CRAC Blower Fan Unit"
        isLocked={!unlockedObjects.includes('cooling_fan') && currentStageOrder < 2}
        isActive={isFanRestored}
        position={[-2.0, 1.2, -4.5]}
        scale={[1.5, 1.5, 1.5]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Warning Beacon (Stage 2) */}
      <WarningBeacon
        id="warning_led"
        name="Status Alert Beacon"
        isLocked={!unlockedObjects.includes('warning_led') && currentStageOrder < 2}
        state={warningLedState}
        position={[-1.5, 2.2, -4.0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Piezo Acoustic Buzzer (Stage 2) */}
      <AlarmBuzzer
        id="buzzer"
        name="Piezo Acoustic Alarm"
        isLocked={!unlockedObjects.includes('buzzer') && currentStageOrder < 2}
        isActive={isEmergencyActive}
        position={[-1.2, 2.2, -4.0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Water Detection Sensor (Stage 3) */}
      <WaterSensor
        id="water_sensor"
        name="Drip Tray Water Sensor"
        isLocked={!unlockedObjects.includes('water_sensor') && currentStageOrder < 3}
        voltage={0.0}
        isWet={false}
        position={[-2.0, 0.1, -4.5]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Drainage Basin Tray (Stage 3) */}
      <DrainageTray
        id="drainage_tray"
        name="Condensate Drainage Tray"
        isLocked={!unlockedObjects.includes('drainage_tray') && currentStageOrder < 3}
        position={[-2.0, 0.05, -4.5]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Datacenter Spares & Tool Locker (Unlocked on Stage 2 Complete) */}
      <LockedCabinet
        id="cabinet_01"
        name="Equipment Spares Cabinet"
        isLocked={!isCabinetUnlocked}
        position={[5.5, 1.5, -3.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Emergency Breaker Override Panel (Unlocked on Stage 3 Complete) */}
      <ControlPanel
        id="control_panel"
        name="Emergency Breaker Panel"
        isLocked={!isControlPanelUnlocked}
        position={[0.0, 1.5, -4.8]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Hermetic Datacenter Exit Portal (Unlocked on Stage 4 / Mission Complete) */}
      <ExitDoor
        id="exit_door"
        name="Hermetic Exit Door"
        isLocked={!isExitUnlocked}
        position={[6.85, 1.5, 0.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />
    </group>
  );
};
