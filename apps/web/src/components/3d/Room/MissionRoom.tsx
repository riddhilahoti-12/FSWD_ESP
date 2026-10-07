'use client';

import React from 'react';
import { MissionState } from '@missionx/shared';
import { ServerRoomScene } from '../missions/server-room/ServerRoomScene';
import { SignalLabScene } from '../missions/signal-lab/SignalLabScene';
import { SensorNetworkScene } from '../missions/sensor-network/SensorNetworkScene';
import { PowerGridScene } from '../missions/power-grid/PowerGridScene';
import { GreenhouseScene } from '../missions/greenhouse/GreenhouseScene';

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
  // Normalize slug for robust matching
  const slug = (missionState.slug || '').toLowerCase();

  switch (slug) {
    case 'signal-in-the-lab':
      return (
        <SignalLabScene
          missionState={missionState}
          onObjectClick={onObjectClick}
          onObjectHover={onObjectHover}
        />
      );

    case 'lost-sensor-network':
      return (
        <SensorNetworkScene
          missionState={missionState}
          onObjectClick={onObjectClick}
          onObjectHover={onObjectHover}
        />
      );

    case 'power-grid-calibration':
      return (
        <PowerGridScene
          missionState={missionState}
          onObjectClick={onObjectClick}
          onObjectHover={onObjectHover}
        />
      );

    case 'smart-greenhouse-mystery':
      return (
        <GreenhouseScene
          missionState={missionState}
          onObjectClick={onObjectClick}
          onObjectHover={onObjectHover}
        />
      );

    case 'rescue-the-server-room':
    default:
      return (
        <ServerRoomScene
          missionState={missionState}
          onObjectClick={onObjectClick}
          onObjectHover={onObjectHover}
        />
      );
  }
};
