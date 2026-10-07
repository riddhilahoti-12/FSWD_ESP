'use client';

import React from 'react';
import { MissionState } from '@missionx/shared';
import ServerRoomShell from '../../Room/ServerRoomShell';
import CableTrays from '../../Room/CableTrays';
import RoomLighting from '../../Room/RoomLighting';
import { EnvironmentEffects } from '../../Room/EnvironmentEffects';
import { ServerRack } from '../../Objects/ServerRack';
import { TemperatureSensor } from '../../Objects/TemperatureSensor';
import { HumiditySensor } from '../../Objects/HumiditySensor';
import { CoolingFan } from '../../Objects/CoolingFan';
import { WarningBeacon } from '../../Objects/WarningBeacon';
import { AlarmBuzzer } from '../../Objects/AlarmBuzzer';
import { WaterSensor } from '../../Objects/WaterSensor';
import { DrainageTray } from '../../Objects/DrainageTray';
import { ControlPanel } from '../../Objects/ControlPanel';
import { LockedCabinet } from '../../Objects/LockedCabinet';
import { ExitDoor } from '../../Objects/ExitDoor';
import { useIoTStore } from '@/store/useIoTStore';

interface SceneProps {
  missionState: MissionState;
  onObjectClick: (objectId: string) => void;
  onObjectHover: (objectId: string | null, name: string | null, isLocked: boolean) => void;
}

export const ServerRoomScene: React.FC<SceneProps> = ({
  missionState,
  onObjectClick,
  onObjectHover,
}) => {
  const { unlockedObjects, completedStages, activeStage, isExitUnlocked } = missionState;

  // Live IoT telemetry hooks from useIoTStore
  const tempReading = useIoTStore((state) => state.sensors.temperatureC);
  const humReading = useIoTStore((state) => state.sensors.humidityPct);
  const isWaterDetected = useIoTStore((state) => state.sensors.waterDetected);
  const fanActuator = useIoTStore((state) => state.actuators.fan);
  const warningLedActuator = useIoTStore((state) => state.actuators.warningLed);
  const buzzerActuator = useIoTStore((state) => state.actuators.buzzer);

  const isFanRestored = completedStages.includes(4);
  const isEmergencyActive = !completedStages.includes(4);
  const currentStageOrder = activeStage?.order ?? 1;
  const warningLedState =
    !warningLedActuator || isFanRestored ? 'OFF' : currentStageOrder >= 2 ? 'ACTIVE' : 'WARNING';
  const isCabinetUnlocked = unlockedObjects.includes('cabinet_01');
  const isControlPanelUnlocked = unlockedObjects.includes('control_panel');

  return (
    <group>
      <ServerRoomShell />
      <CableTrays />
      <RoomLighting isWarningActive={isEmergencyActive} isEmergencyActive={isEmergencyActive} />
      <EnvironmentEffects />

      {/* Server Racks */}
      <ServerRack position={[-4.5, 0, -5.0]} />
      <ServerRack position={[-4.5, 0, -3.8]} />
      <ServerRack position={[-4.5, 0, -2.6]} />
      <ServerRack position={[-4.5, 0, -1.4]} />
      <ServerRack position={[-4.5, 0, -0.2]} />
      <ServerRack position={[-4.5, 0, 1.0]} />
      <ServerRack position={[-4.5, 0, 2.2]} />

      <ServerRack position={[4.0, 0, -5.0]} rotation={[0, Math.PI, 0]} />
      <ServerRack position={[4.0, 0, -1.4]} rotation={[0, Math.PI, 0]} />
      <ServerRack position={[4.0, 0, 1.0]} rotation={[0, Math.PI, 0]} />
      <ServerRack position={[4.0, 0, 2.2]} rotation={[0, Math.PI, 0]} />

      {/* Temperature Sensor */}
      <TemperatureSensor
        id="temperature_sensor"
        name="Ambient Temperature Sensor"
        isLocked={activeStage?.id !== 'stage-1'}
        position={[2.5, 1.8, -3.0]}
        reading={`${tempReading.toFixed(1)}°C`}
        isAlert={tempReading > 28.0 || isEmergencyActive}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Humidity Sensor */}
      <HumiditySensor
        id="humidity_sensor"
        name="Ambient Humidity Probe"
        isLocked={activeStage?.id !== 'stage-1'}
        position={[2.8, 1.8, -3.0]}
        reading={`${humReading.toFixed(0)}%`}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Cooling Fan */}
      <CoolingFan
        id="cooling_fan"
        name="CRAC Blower Ventilation Fan"
        isLocked={activeStage?.id !== 'stage-2'}
        position={[-2.0, 1.2, -4.5]}
        isActive={fanActuator && isFanRestored}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Warning Beacon */}
      <WarningBeacon
        id="warning_led"
        name="Diagnostic Warning Beacon"
        isLocked={activeStage?.id !== 'stage-2'}
        position={[-1.5, 2.2, -4.0]}
        state={warningLedState}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Buzzer */}
      <AlarmBuzzer
        id="buzzer"
        name="Piezo Alarm Buzzer"
        isLocked={activeStage?.id !== 'stage-2'}
        position={[-1.2, 2.2, -4.0]}
        isActive={buzzerActuator || isEmergencyActive}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Water Sensor & Drainage Tray */}
      <WaterSensor
        id="water_sensor"
        name="Condensate Moisture Sensor"
        isLocked={activeStage?.id !== 'stage-3'}
        position={[-2.0, 0.1, -4.5]}
        isWet={isWaterDetected}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />
      <DrainageTray
        id="drainage_tray"
        name="Condensate Drain Pan"
        isLocked={activeStage?.id !== 'stage-3'}
        position={[-2.0, 0.05, -4.5]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Control Panel */}
      <ControlPanel
        id="control_panel"
        name="Emergency Breaker Panel"
        isLocked={!isControlPanelUnlocked && activeStage?.id !== 'stage-4'}
        position={[0.0, 1.5, -4.8]}
        isPowerRestored={isFanRestored}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Locked Supply Cabinet */}
      <LockedCabinet
        id="cabinet_01"
        name="Diagnostic Supply Cabinet"
        isUnlocked={isCabinetUnlocked}
        position={[5.5, 1.5, -3.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />

      {/* Exit Door */}
      <ExitDoor
        id="exit_door"
        name="Datacenter Exit Portal"
        isOpen={isExitUnlocked}
        position={[4.0, 1.5, 0.0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={onObjectClick}
        onHover={onObjectHover}
      />
    </group>
  );
};
