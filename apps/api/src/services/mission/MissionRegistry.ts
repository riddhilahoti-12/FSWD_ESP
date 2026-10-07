import {
  MissionDefinition,
  ClientMissionDefinition,
  ClientQuestion,
} from '@missionx/shared';

export const RESCUE_THE_SERVER_ROOM_DEFINITION: MissionDefinition = {
  id: 'mission-server-room-01',
  slug: 'rescue-the-server-room',
  title: 'Rescue the Server Room',
  domain: 'IoT / Embedded Systems',
  difficulty: 'Medium',
  description:
    'A critical campus datacenter cluster is triggering thermal overload alarms. Enter the server room, analyze live environmental telemetry, diagnose the cooling failure, and restore normal operations before automatic emergency shutdown occurs.',
  briefing:
    'The server room is overheating. Determine whether the cooling system is functioning correctly.',
  estimatedDuration: '10–15 min',
  learningObjectives: [
    'Interpret temperature readings',
    'Interpret humidity readings',
    'Understand basic IoT sensor data',
    'Understand actuator behavior',
    'Apply basic embedded-system reasoning',
    'Make decisions from environmental telemetry',
  ],
  version: 1,
  settings: {
    allowHints: true,
    maxAttempts: 5,
    passScorePercentage: 70,
  },
  stages: [
    {
      id: 'stage-1',
      order: 1,
      title: 'Assess the Environment',
      objective: 'Inspect environmental sensors and determine whether thermal conditions are safe.',
      description:
        'Audible alarms are pinging datacenter monitoring. Access the ambient telemetry nodes and evaluate temperature and humidity against safe operational limits.',
      interactionIds: [
        'inspect-temp-sensor',
        'inspect-humidity-sensor',
        'q1-temp-safe-interaction',
      ],
      questionIds: ['q1_temp_safe'],
      hintIds: ['hint-stage-1'],
      rewardIds: ['reward-stage-1-xp', 'reward-stage-1-score'],
    },
    {
      id: 'stage-2',
      order: 2,
      title: 'Inspect the Cooling System',
      objective: 'Diagnose the status of the cooling fan, status LEDs, and warning buzzer.',
      description:
        'With thermal limits breached, investigate the Computer Room Air Conditioning (CRAC) unit and check why ventilation has ceased.',
      interactionIds: [
        'inspect-warning-led',
        'inspect-buzzer',
        'inspect-cooling-fan',
        'q2-cooling-diagnosis-interaction',
      ],
      questionIds: ['q2_cooling_diagnosis'],
      hintIds: ['hint-stage-2'],
      rewardIds: ['reward-stage-2-xp', 'reward-stage-2-score'],
    },
    {
      id: 'stage-3',
      order: 3,
      title: 'Check for Environmental Risk',
      objective: 'Inspect the condensate drainage tray to rule out liquid leakage hazards.',
      description:
        'Before re-energizing the high-power cooling circuit, confirm whether condensation or liquid overflow caused the breaker trip.',
      interactionIds: [
        'inspect-water-sensor',
        'inspect-drainage-tray',
        'q3-water-safety-interaction',
      ],
      questionIds: ['q3_water_safety'],
      hintIds: ['hint-stage-3'],
      rewardIds: [
        'reward-stage-3-xp',
        'reward-stage-3-score',
        'reward-stage-3-clue-breaker-code',
      ],
    },
    {
      id: 'stage-4',
      order: 4,
      title: 'Restore Safe Operation',
      objective: 'Access the control panel, enter the breaker authorization code, and restore cooling.',
      description:
        'Input the clearance code into the emergency control panel to reset the circuit breaker, restore fan rotation, and unlock the exit door.',
      interactionIds: ['inspect-control-panel', 'q4-cooling-restart-interaction'],
      questionIds: ['q4_cooling_restart'],
      hintIds: ['hint-stage-4'],
      rewardIds: [
        'reward-stage-4-xp',
        'reward-stage-4-score',
        'reward-stage-4-badge-server-savior',
      ],
      isFinalStage: true,
    },
  ],
  scene: {
    objects: [
      // Stage 1 Objects
      {
        id: 'temperature_sensor',
        name: 'Ambient DHT22 Temperature Probe',
        type: 'sensor',
        position: [2.5, 1.8, -3.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        interactionType: 'sensor',
        stageId: 'stage-1',
        locked: false,
        visible: true,
        metadata: {
          sensorModel: 'DHT22 Digital Humidity & Temperature Sensor',
          telemetryKey: 'temperature',
          currentValue: '31.8 °C',
          optimalRange: '20.0 °C - 28.0 °C',
          status: 'OVERHEATING_CRITICAL',
        },
      },
      {
        id: 'humidity_sensor',
        name: 'Ambient DHT22 Humidity Probe',
        type: 'sensor',
        position: [2.8, 1.8, -3.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        interactionType: 'sensor',
        stageId: 'stage-1',
        locked: false,
        visible: true,
        metadata: {
          sensorModel: 'DHT22 Digital Humidity & Temperature Sensor',
          telemetryKey: 'humidity',
          currentValue: '68.0 %',
          optimalRange: '40.0 % - 60.0 %',
          status: 'ELEVATED',
        },
      },
      // Stage 2 Objects
      {
        id: 'warning_led',
        name: 'Status Alert Beacon (Red)',
        type: 'actuator',
        position: [-1.5, 2.2, -4.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        interactionType: 'inspect',
        stageId: 'stage-2',
        locked: true,
        visible: true,
        metadata: {
          color: 'red',
          mode: 'blinking',
          diagnosticCode: 'ER-FAN-04',
          description: 'High thermal disparity detected in primary duct',
        },
      },
      {
        id: 'buzzer',
        name: 'Piezo Acoustic Alarm',
        type: 'actuator',
        position: [-1.2, 2.2, -4.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        interactionType: 'inspect',
        stageId: 'stage-2',
        locked: true,
        visible: true,
        metadata: {
          acousticLevel: '85 dB',
          pattern: 'pulsed_2hz',
          state: 'ACTIVE',
        },
      },
      {
        id: 'cooling_fan',
        name: 'Primary CRAC Blower Fan Unit',
        type: 'actuator',
        position: [-2.0, 1.2, -4.5],
        rotation: [0, 0, 0],
        scale: [1.5, 1.5, 1.5],
        interactionType: 'inspect',
        stageId: 'stage-2',
        locked: true,
        visible: true,
        metadata: {
          rpm: 0,
          breakerState: 'TRIPPED',
          targetRpm: 2400,
          status: 'OFFLINE',
        },
      },
      // Stage 3 Objects
      {
        id: 'water_sensor',
        name: 'Drip Tray Resistive Water Sensor',
        type: 'sensor',
        position: [-2.0, 0.1, -4.5],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        interactionType: 'sensor',
        stageId: 'stage-3',
        locked: true,
        visible: true,
        metadata: {
          analogVoltage: '0.0 V',
          liquidDetected: false,
          status: 'DRY_NOMINAL',
        },
      },
      {
        id: 'drainage_tray',
        name: 'Coolant Condensation Drainage Basin',
        type: 'container',
        position: [-2.0, 0.05, -4.5],
        rotation: [0, 0, 0],
        scale: [1.2, 0.2, 1.2],
        interactionType: 'inspect',
        stageId: 'stage-3',
        locked: true,
        visible: true,
        metadata: {
          standingLiquid: false,
          drainageValve: 'CLEAR',
        },
      },
      // Stage 3 & Auxiliary Objects
      {
        id: 'cabinet_01',
        name: 'Datacenter Spares & Tool Locker',
        type: 'cabinet',
        position: [5.5, 1.5, -3.0],
        rotation: [0, -90, 0],
        scale: [1.2, 2.4, 0.8],
        interactionType: 'cabinet',
        stageId: 'stage-3',
        locked: true,
        visible: true,
        metadata: {
          requiresExplicitUnlock: true,
          unlockConditions: [{ type: 'STAGE_COMPLETED', stageId: 'stage-2' }],
          description: 'Secure equipment cabinet housing diagnostic adapters and emergency bypass tools.',
        },
      },
      // Stage 4 Objects
      {
        id: 'control_panel',
        name: 'Emergency Breaker Override Panel',
        type: 'control_panel',
        position: [0.0, 1.5, -4.8],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        interactionType: 'control_panel',
        stageId: 'stage-4',
        locked: true,
        visible: true,
        metadata: {
          requiresExplicitUnlock: true,
          unlockConditions: [{ type: 'STAGE_COMPLETED', stageId: 'stage-3' }],
          interface: 'Keypad / Code Entry',
          state: 'LOCKED',
        },
      },
      {
        id: 'exit_door',
        name: 'Datacenter Hermetic Exit Portal',
        type: 'door',
        position: [4.0, 1.5, 0.0],
        rotation: [0, -90, 0],
        scale: [1, 2.2, 1],
        interactionType: 'door',
        stageId: 'stage-4',
        locked: true,
        visible: true,
        metadata: {
          state: 'EMERGENCY_LOCKDOWN',
          requiresExplicitUnlock: true,
          unlockConditions: [{ type: 'STAGE_COMPLETED', stageId: 'stage-4' }],
        },
      },
    ],
  },
  interactions: [
    // Stage 1 Interactions
    {
      id: 'inspect-temp-sensor',
      type: 'sensor',
      targetObjectId: 'temperature_sensor',
      stageId: 'stage-1',
      title: 'Inspect Temperature Sensor',
      description: 'Query DHT22 probe for ambient temperature telemetry.',
      feedbackMessage:
        'DHT22 Probe Telemetry: Current Temperature is 31.8°C (Normal ASHRAE threshold: 20.0°C - 28.0°C). CRITICAL OVERHEATING ALERT.',
      config: {
        sensorKey: 'temperature',
        reading: 31.8,
        unit: '°C',
        status: 'CRITICAL',
      },
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'inspect-humidity-sensor',
      type: 'sensor',
      targetObjectId: 'humidity_sensor',
      stageId: 'stage-1',
      title: 'Inspect Humidity Sensor',
      description: 'Query DHT22 probe for relative humidity telemetry.',
      feedbackMessage:
        'DHT22 Probe Telemetry: Current Relative Humidity is 68.0% (Optimal: 40% - 60%). High humidity increases risk of condensation.',
      config: {
        sensorKey: 'humidity',
        reading: 68.0,
        unit: '%',
        status: 'ELEVATED',
      },
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'q1-temp-safe-interaction',
      type: 'question',
      targetObjectId: 'temperature_sensor',
      stageId: 'stage-1',
      title: 'Evaluate Environmental Safety',
      questionId: 'q1_temp_safe',
      requiredToCompleteStage: true,
      successEvent: 'QUESTION_ANSWERED',
    },

    // Stage 2 Interactions
    {
      id: 'inspect-warning-led',
      type: 'inspect',
      targetObjectId: 'warning_led',
      stageId: 'stage-2',
      title: 'Inspect Status Alert Beacon',
      feedbackMessage:
        'Alert LED Beacon is flashing RED at 2Hz. Diagnostic telemetry code: ER-FAN-04 (Cooling Unit Blower Stalled).',
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'inspect-buzzer',
      type: 'inspect',
      targetObjectId: 'buzzer',
      stageId: 'stage-2',
      title: 'Inspect Acoustic Alarm Buzzer',
      feedbackMessage:
        'Piezo alarm emitting 85dB pulsed warning. Tripped by thermal overload safety sensor.',
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'inspect-cooling-fan',
      type: 'inspect',
      targetObjectId: 'cooling_fan',
      stageId: 'stage-2',
      title: 'Inspect CRAC Cooling Fan',
      feedbackMessage:
        'Cooling blower fan is motionless at 0 RPM. The internal electromagnetic circuit breaker switch has flipped to TRIPPED.',
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'q2-cooling-diagnosis-interaction',
      type: 'question',
      targetObjectId: 'cooling_fan',
      stageId: 'stage-2',
      title: 'Determine Cooling Diagnostic Priority',
      questionId: 'q2_cooling_diagnosis',
      requiredToCompleteStage: true,
      successEvent: 'QUESTION_ANSWERED',
    },

    // Stage 3 Interactions
    {
      id: 'inspect-water-sensor',
      type: 'sensor',
      targetObjectId: 'water_sensor',
      stageId: 'stage-3',
      title: 'Inspect Water Detection Sensor',
      feedbackMessage:
        'Water Level Sensor reads 0.0V (Logic LOW). Drip tray is bone-dry with no standing water or coolant leakage detected.',
      config: {
        voltage: 0.0,
        isWet: false,
      },
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'inspect-drainage-tray',
      type: 'inspect',
      targetObjectId: 'drainage_tray',
      stageId: 'stage-3',
      title: 'Inspect Condensation Drainage Tray',
      feedbackMessage:
        'Drainage basin inspected: Clear of debris, outlet pipe unobstructed. Electrical hazard ruled out.',
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'q3-water-safety-interaction',
      type: 'question',
      targetObjectId: 'water_sensor',
      stageId: 'stage-3',
      title: 'Verify Environmental Electrical Clearance',
      questionId: 'q3_water_safety',
      requiredToCompleteStage: true,
      successEvent: 'QUESTION_ANSWERED',
    },

    // Stage 4 Interactions
    {
      id: 'inspect-control-panel',
      type: 'control_panel',
      targetObjectId: 'control_panel',
      stageId: 'stage-4',
      title: 'Inspect Emergency Override Panel',
      feedbackMessage:
        'Control Panel Status: Ready for Authorization Code Entry. Resetting the breaker will restore CRAC fan rotation and vent heat.',
      successEvent: 'OBJECT_INSPECTED',
    },
    {
      id: 'q4-cooling-restart-interaction',
      type: 'code_input',
      targetObjectId: 'control_panel',
      stageId: 'stage-4',
      title: 'Enter Breaker Authorization Code',
      questionId: 'q4_cooling_restart',
      requiredToCompleteStage: true,
      successEvent: 'CODE_SUBMITTED',
    },
  ],
  questions: [
    {
      id: 'q1_temp_safe',
      stageId: 'stage-1',
      prompt:
        'Ambient sensors report temperature at 31.8°C and relative humidity at 68.0%. According to enterprise datacenter standards (safe range: 20.0°C - 28.0°C), is the server room operating safely?',
      type: 'multiple_choice',
      options: [
        'Yes - Conditions are nominal and within safe operational limits',
        'No - Server room is overheating above the 28.0°C safe threshold',
      ],
      correctAnswer: 'No - Server room is overheating above the 28.0°C safe threshold',
      explanation:
        'Standard ASHRAE server room guidelines require temperatures between 20°C and 28°C. At 31.8°C, hardware experiences accelerated wear and thermal throttling.',
      points: 100,
      learningObjective: 'Interpret temperature readings against datacenter tolerances',
    },
    {
      id: 'q2_cooling_diagnosis',
      stageId: 'stage-2',
      prompt:
        'The warning LED indicates ER-FAN-04 and the cooling blower is stopped (0 RPM) with its breaker tripped. What is the immediate engineering priority before energizing the high-power circuit?',
      type: 'multiple_choice',
      options: [
        'Reboot the core database cluster to reduce CPU thermal load',
        'Inspect cooling ductwork and check for coolant leaks or condensation hazards',
        'Unplug temperature sensors to silence the acoustic alarm',
        'Increase server computation to clear air resistance',
      ],
      correctAnswer:
        'Inspect cooling ductwork and check for coolant leaks or condensation hazards',
      explanation:
        'Tripped breakers in high-power HVAC equipment commonly indicate motor stalls from obstructions or safety interlocks triggered by liquid overflow in drainage trays.',
      points: 100,
      learningObjective: 'Understand actuator behavior and diagnostic failure modes',
    },
    {
      id: 'q3_water_safety',
      stageId: 'stage-3',
      prompt:
        'Water sensor telemetry reads 0.0V (dry) and the drainage basin is clear. Is it safe from electrical short-circuit hazards to proceed with resetting the cooling breaker?',
      type: 'multiple_choice',
      options: [
        'Yes - Drainage is clear with no water hazard detected; proceed to breaker override',
        'No - Catastrophic coolant flooding is in progress',
      ],
      correctAnswer:
        'Yes - Drainage is clear with no water hazard detected; proceed to breaker override',
      explanation:
        'A reading of 0.0V confirms no conductivity across sensor traces, ruling out liquid electrical hazards and clearing authorization for electrical panel intervention.',
      points: 100,
      learningObjective: 'Make safety decisions from environmental telemetry',
    },
    {
      id: 'q4_cooling_restart',
      stageId: 'stage-4',
      prompt:
        'Enter the 4-digit authorization code discovered during the drainage inspection clearance to reset the circuit breaker and restore cooling airflow:',
      type: 'code',
      correctAnswer: '4180',
      explanation:
        'Code 4180 verified! Circuit breaker contactors close, CRAC fan accelerates to 2400 RPM, and temperature drops back into nominal range.',
      points: 150,
      learningObjective: 'Apply embedded system reasoning to restore safe operations',
    },
  ],
  hints: [
    {
      id: 'hint-stage-1',
      stageId: 'stage-1',
      text: 'Compare the current temperature reading (31.8°C) with the safe operating envelope (20.0°C - 28.0°C). Any value exceeding 28.0°C is an active thermal anomaly.',
      penalty: 10,
      order: 1,
    },
    {
      id: 'hint-stage-2',
      stageId: 'stage-2',
      text: 'A tripped circuit breaker indicates a protective shutdown. Technicians must inspect physical obstacles and verify that liquid overflow has not shorted the tray.',
      penalty: 10,
      order: 1,
    },
    {
      id: 'hint-stage-3',
      stageId: 'stage-3',
      text: 'Water detection sensor output of 0.0V indicates logic LOW (dry). This confirms no water has accumulated in the basin.',
      penalty: 10,
      order: 1,
    },
    {
      id: 'hint-stage-4',
      stageId: 'stage-4',
      text: 'Review the safety clearance clue revealed in your Clues drawer after completing Stage 3 (Code: 4180).',
      penalty: 10,
      order: 1,
    },
  ],
  rewards: [
    {
      id: 'reward-stage-1-xp',
      type: 'XP',
      amount: 50,
    },
    {
      id: 'reward-stage-1-score',
      type: 'SCORE',
      amount: 100,
    },
    {
      id: 'reward-stage-2-xp',
      type: 'XP',
      amount: 50,
    },
    {
      id: 'reward-stage-2-score',
      type: 'SCORE',
      amount: 100,
    },
    {
      id: 'reward-stage-3-xp',
      type: 'XP',
      amount: 50,
    },
    {
      id: 'reward-stage-3-score',
      type: 'SCORE',
      amount: 100,
    },
    {
      id: 'reward-stage-3-clue-breaker-code',
      type: 'CLUE',
      value: 'Breaker Authorization Clearance Code is 4180',
    },
    {
      id: 'reward-stage-4-xp',
      type: 'XP',
      amount: 100,
    },
    {
      id: 'reward-stage-4-score',
      type: 'SCORE',
      amount: 200,
    },
    {
      id: 'reward-stage-4-badge-server-savior',
      type: 'BADGE',
      badgeId: 'SERVER_SAVIOR',
      value: 'Server Savior: Restored datacenter cooling during critical thermal crisis',
    },
  ],
};

export class MissionRegistry {
  private static missions: Map<string, MissionDefinition> = new Map([
    [RESCUE_THE_SERVER_ROOM_DEFINITION.slug, RESCUE_THE_SERVER_ROOM_DEFINITION],
    [RESCUE_THE_SERVER_ROOM_DEFINITION.id, RESCUE_THE_SERVER_ROOM_DEFINITION],
  ]);

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
}
