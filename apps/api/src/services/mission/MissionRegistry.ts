import {
  MissionDefinition,
  ClientMissionDefinition,
  ClientQuestion,
} from '@missionx/shared';
import { RESCUE_THE_SERVER_ROOM_DEFINITION } from './definitions/rescueServerRoom';
import { SIGNAL_IN_THE_LAB_DEFINITION } from './definitions/signalInTheLab';
import { THE_LOST_SENSOR_NETWORK_DEFINITION } from './definitions/lostSensorNetwork';
import { POWER_GRID_CALIBRATION_DEFINITION } from './definitions/powerGridCalibration';
import { THE_SMART_GREENHOUSE_MYSTERY_DEFINITION } from './definitions/smartGreenhouseMystery';

// Re-export definitions for backwards compatibility with existing tests and services
export {
  RESCUE_THE_SERVER_ROOM_DEFINITION,
  SIGNAL_IN_THE_LAB_DEFINITION,
  THE_LOST_SENSOR_NETWORK_DEFINITION,
  POWER_GRID_CALIBRATION_DEFINITION,
  THE_SMART_GREENHOUSE_MYSTERY_DEFINITION,
};

export const ALL_MISSION_DEFINITIONS: MissionDefinition[] = [
  RESCUE_THE_SERVER_ROOM_DEFINITION,
  SIGNAL_IN_THE_LAB_DEFINITION,
  THE_LOST_SENSOR_NETWORK_DEFINITION,
  POWER_GRID_CALIBRATION_DEFINITION,
  THE_SMART_GREENHOUSE_MYSTERY_DEFINITION,
];

export class MissionRegistry {
  private static missions: Map<string, MissionDefinition> = new Map();

  static {
    // Register all missions by both slug and id for rapid O(1) resolution
    for (const mission of ALL_MISSION_DEFINITIONS) {
      this.missions.set(mission.slug.toLowerCase(), mission);
      this.missions.set(mission.id.toLowerCase(), mission);
    }
  }

  /**
   * Retrieves authoritative server-side mission definition
   */
  public static getMission(identifier: string): MissionDefinition | null {
    if (!identifier) return null;
    return this.missions.get(identifier.toLowerCase()) || null;
  }

  /**
   * Returns a sanitized client definition stripping correct answers and secret tolerances
   */
  public static getSanitizedMission(identifier: string): ClientMissionDefinition | null {
    const mission = this.getMission(identifier);
    if (!mission) return null;

    const sanitizedQuestions: ClientQuestion[] = mission.questions.map((q) => {
      const { correctAnswer, tolerance, ...safeQ } = q;
      return safeQ;
    });

    return {
      ...mission,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Retrieves all registered authoritative mission definitions
   */
  public static getAllMissions(): MissionDefinition[] {
    return ALL_MISSION_DEFINITIONS;
  }

  /**
   * Retrieves all sanitized mission definitions for client catalogs
   */
  public static getAllSanitizedMissions(): ClientMissionDefinition[] {
    return ALL_MISSION_DEFINITIONS.map((m) => this.getSanitizedMission(m.slug)!);
  }
}
