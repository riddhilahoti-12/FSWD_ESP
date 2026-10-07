import { z } from 'zod';

// ==========================================
// 1. Roles & Core Enums
// ==========================================
export type UserRole = 'STUDENT' | 'ADMIN';

export type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

// ==========================================
// 2. User Interfaces
// ==========================================
export interface UserStats {
  xp: number;
  missionsCompleted: number;
  missionsStarted: number;
  averageScore: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

// ==========================================
// 3. Gameplay Engine - Interaction & Question Types
// ==========================================
export type InteractionType =
  | 'object_click'
  | 'inspect'
  | 'question'
  | 'multiple_choice'
  | 'numeric_input'
  | 'text_input'
  | 'code_input'
  | 'sequence'
  | 'clue'
  | 'drawer'
  | 'cabinet'
  | 'control_panel'
  | 'sensor'
  | 'waveform'
  | 'door'
  | 'INSPECT'
  | 'READ_SENSOR'
  | 'ANSWER_QUESTION'
  | 'SELECT_OPTION'
  | 'TOGGLE'
  | 'CONFIGURE'
  | 'ACTIVATE'
  | 'ANALYZE'
  | 'UNLOCK'
  | 'FINALIZE';

export type QuestionType =
  | 'multiple_choice'
  | 'numeric'
  | 'text'
  | 'code'
  | 'sequence';

export type RewardType =
  | 'XP'
  | 'SCORE'
  | 'CLUE'
  | 'UNLOCK'
  | 'BADGE';

export type UnlockConditionType =
  | 'STAGE_COMPLETED'
  | 'QUESTION_CORRECT'
  | 'OBJECT_INSPECTED'
  | 'CLUE_REVEALED'
  | 'SENSOR_THRESHOLD'
  | 'ACTUATOR_STATE'
  | 'ALL_REQUIRED_INTERACTIONS'
  | 'CODE_MATCH';

export type MissionEventType =
  | 'OBJECT_INTERACTED'
  | 'OBJECT_INSPECTED'
  | 'QUESTION_STARTED'
  | 'QUESTION_ANSWERED'
  | 'CODE_SUBMITTED'
  | 'SENSOR_UPDATED'
  | 'ACTUATOR_CHANGED'
  | 'CLUE_REVEALED'
  | 'STAGE_COMPLETED'
  | 'OBJECT_UNLOCKED'
  | 'DOOR_UNLOCKED'
  | 'REWARD_GRANTED'
  | 'MISSION_COMPLETED';

// ==========================================
// 4. Mission Engine Definitions
// ==========================================
export interface UnlockCondition {
  type: UnlockConditionType;
  stageId?: string;
  questionId?: string;
  objectId?: string;
  clueId?: string;
  thresholdKey?: string;
  thresholdValue?: number | string;
  targetState?: string;
  requiredInteractionIds?: string[];
  expectedCode?: string;
}

export interface RewardDefinition {
  id: string;
  type: RewardType;
  amount?: number;
  value?: string;
  badgeId?: string;
  targetObjectId?: string;
}

export interface HintDefinition {
  id: string;
  stageId: string;
  text: string;
  penalty: number;
  order: number;
  unlockCondition?: UnlockCondition;
}

export interface QuestionDefinition {
  id: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number | string[];
  tolerance?: number;
  explanation?: string;
  points: number;
  maxAttempts?: number;
  stageId: string;
  learningObjective?: string;
}

export type ClientQuestion = Omit<QuestionDefinition, 'correctAnswer' | 'tolerance'>;

export interface InteractionDefinition {
  id: string;
  type: InteractionType;
  targetObjectId: string;
  stageId: string;
  title: string;
  description?: string;
  config?: Record<string, any>;
  questionId?: string;
  requiredToCompleteStage?: boolean;
  successEvent?: MissionEventType;
  feedbackMessage?: string;
  unlockConditions?: UnlockCondition[];
}

export interface SceneObjectDefinition {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  interactionType: InteractionType;
  stageId: string;
  locked: boolean;
  visible: boolean;
  metadata?: Record<string, any>;
}

export interface StageDefinition {
  id: string;
  order: number;
  title: string;
  objective: string;
  description: string;
  interactionIds: string[];
  questionIds: string[];
  hintIds: string[];
  rewardIds: string[];
  unlockConditions?: UnlockCondition[];
  isFinalStage?: boolean;
}

export interface MissionSettings {
  maxAttempts?: number;
  allowHints: boolean;
  timeLimit?: number;
  passScorePercentage?: number;
}

export interface MissionDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  domain: string;
  difficulty: MissionDifficulty;
  briefing: string;
  estimatedDuration: string;
  learningObjectives: string[];
  version: number;
  stages: StageDefinition[];
  interactions: InteractionDefinition[];
  questions: QuestionDefinition[];
  hints: HintDefinition[];
  rewards: RewardDefinition[];
  scene: {
    objects: SceneObjectDefinition[];
  };
  settings: MissionSettings;
}

// Sanitized definition for sending to frontend
export interface ClientMissionDefinition extends Omit<MissionDefinition, 'questions'> {
  questions: ClientQuestion[];
}

// ==========================================
// 5. Events & Interaction Results
// ==========================================
export interface MissionEvent {
  id: string;
  type: MissionEventType;
  missionId: string;
  stageId?: string;
  objectId?: string;
  studentId: string;
  payload?: Record<string, any>;
  timestamp: string;
}

export interface InteractionResult {
  success: boolean;
  message: string;
  interactionId: string;
  targetObjectId?: string;
  isCorrect?: boolean;
  feedbackData?: Record<string, any>;
  stageCompleted?: boolean;
  missionCompleted?: boolean;
  unlockedObjects?: string[];
  grantedRewards?: RewardDefinition[];
}

// ==========================================
// 6. Mission & Progress State
// ==========================================
export interface AnsweredQuestionRecord {
  questionId: string;
  answer?: any;
  isCorrect: boolean;
  pointsAwarded: number;
  attempts: number;
  answeredAt: string;
}

export interface UsedHintRecord {
  hintId: string;
  text: string;
  penalty: number;
  usedAt: string;
}

export interface RevealedClueRecord {
  clueId: string;
  text: string;
  revealedAt: string;
}

export interface GrantedRewardRecord {
  id: string;
  type: RewardType;
  amount?: number;
  value?: string;
  grantedAt: string;
}

export interface MissionState {
  missionId: string;
  slug: string;
  title: string;
  missionVersion: number;
  studentId: string;
  currentStage: number;
  totalStages: number;
  completedStages: number[];
  unlockedObjects: string[];
  revealedClues: RevealedClueRecord[];
  answeredQuestions: AnsweredQuestionRecord[];
  usedHints: UsedHintRecord[];
  completedInteractions: string[];
  score: number;
  xp: number;
  attempts: number;
  hintsUsed: number;
  elapsedTime: number;
  status: ProgressStatus;
  activeStage: StageDefinition | null;
  availableInteractions: InteractionDefinition[];
  availableQuestions: ClientQuestion[];
  availableHints: {
    id: string;
    stageId: string;
    penalty: number;
    order: number;
    isUsed: boolean;
    text?: string;
  }[];
  sceneObjects: SceneObjectDefinition[];
  isExitUnlocked: boolean;
  rewards?: GrantedRewardRecord[];
}

// ==========================================
// 7. Base Mission Interface (from Phase 1)
// ==========================================
export interface Mission {
  _id: string;
  title: string;
  slug: string;
  domain: string;
  difficulty: MissionDifficulty;
  description: string;
  briefing: string;
  learningObjectives: string[];
  estimatedDuration: string;
  thumbnail?: string;
  published: boolean;
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  _id: string;
  studentId: string;
  missionId: string | Mission;
  missionVersion?: number;
  currentStage: number;
  completedStages: number[];
  completedInteractions?: string[];
  answeredQuestions?: AnsweredQuestionRecord[];
  unlockedObjects?: string[];
  revealedClues?: RevealedClueRecord[];
  usedHints?: UsedHintRecord[];
  rewards?: GrantedRewardRecord[];
  eventLog?: MissionEvent[];
  score: number;
  attempts: number;
  hintsUsed: number;
  elapsedTime: number;
  status: ProgressStatus;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

// ==========================================
// 8. Standard API Response Structure
// ==========================================
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==========================================
// 9. Zod Validation Schemas
// ==========================================
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const interactionInputSchema = z.object({
  payload: z.record(z.any()).default({}),
});

export type InteractionInput = z.infer<typeof interactionInputSchema>;

// ==========================================
// 10. IoT & Telemetry Types (Phase 4)
// ==========================================
export type IoTDeviceStatus = 'ONLINE' | 'OFFLINE' | 'SIMULATED' | 'ERROR';

export type IoTDeviceType = 'ESP32' | 'SENSOR' | 'ACTUATOR' | 'SIMULATOR';

export type SimulationMode =
  | 'NORMAL'
  | 'OVERHEATING'
  | 'COOLING'
  | 'WATER_ALERT'
  | 'RECOVERY';

export interface SensorReading {
  temperatureC: number;
  humidityPct: number;
  waterDetected: boolean;
  voltage?: number;
  [key: string]: number | boolean | string | undefined;
}

export interface ActuatorState {
  fan: boolean;
  warningLed: boolean;
  buzzer: boolean;
  breakerTripped?: boolean;
  [key: string]: boolean | number | string | undefined;
}

export interface IoTTelemetry {
  deviceId: string;
  missionId: string;
  timestamp: string;
  sensors: SensorReading;
  actuators: ActuatorState;
  simulationMode?: SimulationMode;
  metadata?: Record<string, any>;
}

export interface IoTDevice {
  _id?: string;
  deviceId: string;
  missionId: string;
  name: string;
  type: IoTDeviceType;
  status: IoTDeviceStatus;
  metadata?: Record<string, any>;
  lastTelemetryAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IoTCommandType =
  | 'SET_FAN'
  | 'SET_WARNING_LED'
  | 'SET_BUZZER'
  | 'RESET_ALARM'
  | 'SET_SIMULATION_MODE'
  | 'SET_TEMPERATURE'
  | 'SET_HUMIDITY'
  | 'SET_WATER';

export interface IoTCommand {
  deviceId: string;
  command: IoTCommandType;
  value: boolean | number | string;
  issuedBy?: string;
  timestamp?: string;
}

export interface IoTEvent {
  id: string;
  type: 'iot:telemetry' | 'iot:actuator' | 'iot:status' | 'iot:command_ack';
  deviceId: string;
  missionId: string;
  payload: any;
  timestamp: string;
}

// Zod schemas for IoT Validation
export const ioTCommandSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  command: z.enum([
    'SET_FAN',
    'SET_WARNING_LED',
    'SET_BUZZER',
    'RESET_ALARM',
    'SET_SIMULATION_MODE',
    'SET_TEMPERATURE',
    'SET_HUMIDITY',
    'SET_WATER',
  ]),
  value: z.union([z.boolean(), z.number(), z.string()]),
});

export type IoTCommandInput = z.infer<typeof ioTCommandSchema>;

export const simulationModeSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  mode: z.enum(['NORMAL', 'OVERHEATING', 'COOLING', 'WATER_ALERT', 'RECOVERY']),
});

export type SimulationModeInput = z.infer<typeof simulationModeSchema>;
