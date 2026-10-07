import { MissionEvent, MissionEventType } from '@missionx/shared';
import crypto from 'crypto';

export class MissionEventService {
  public static createEvent(
    type: MissionEventType,
    missionId: string,
    studentId: string,
    stageId?: string,
    objectId?: string,
    payload?: Record<string, any>
  ): MissionEvent {
    return {
      id: crypto.randomUUID(),
      type,
      missionId,
      studentId,
      stageId,
      objectId,
      payload: payload || {},
      timestamp: new Date().toISOString(),
    };
  }
}
