import { Schema, model, Document, Types } from 'mongoose';
import {
  ProgressStatus,
  AnsweredQuestionRecord,
  UsedHintRecord,
  RevealedClueRecord,
  GrantedRewardRecord,
  MissionEvent,
} from '@missionx/shared';

export interface IProgressDocument extends Document {
  studentId: Types.ObjectId;
  missionId: Types.ObjectId;
  missionVersion: number;
  currentStage: number;
  completedStages: number[];
  completedInteractions: string[];
  answeredQuestions: AnsweredQuestionRecord[];
  unlockedObjects: string[];
  revealedClues: RevealedClueRecord[];
  usedHints: UsedHintRecord[];
  rewards: GrantedRewardRecord[];
  eventLog: MissionEvent[];
  score: number;
  attempts: number;
  hintsUsed: number;
  elapsedTime: number;
  status: ProgressStatus;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgressDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    missionId: {
      type: Schema.Types.ObjectId,
      ref: 'Mission',
      required: true,
      index: true,
    },
    missionVersion: {
      type: Number,
      default: 1,
    },
    currentStage: {
      type: Number,
      default: 1,
    },
    completedStages: {
      type: [Number],
      default: [],
    },
    completedInteractions: {
      type: [String],
      default: [],
    },
    answeredQuestions: [
      {
        questionId: { type: String, required: true },
        answer: { type: Schema.Types.Mixed },
        isCorrect: { type: Boolean, required: true },
        pointsAwarded: { type: Number, default: 0 },
        attempts: { type: Number, default: 1 },
        answeredAt: { type: Date, default: Date.now },
      },
    ],
    unlockedObjects: {
      type: [String],
      default: [],
    },
    revealedClues: [
      {
        clueId: { type: String, required: true },
        text: { type: String, required: true },
        revealedAt: { type: Date, default: Date.now },
      },
    ],
    usedHints: [
      {
        hintId: { type: String, required: true },
        text: { type: String, required: true },
        penalty: { type: Number, default: 0 },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    rewards: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true },
        amount: { type: Number },
        value: { type: String },
        grantedAt: { type: Date, default: Date.now },
      },
    ],
    eventLog: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true },
        missionId: { type: String, required: true },
        stageId: { type: String },
        objectId: { type: String },
        studentId: { type: String, required: true },
        payload: { type: Schema.Types.Mixed },
        timestamp: { type: String, required: true },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    elapsedTime: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
      index: true,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index so a student has a single progress state per mission
progressSchema.index({ studentId: 1, missionId: 1 }, { unique: true });

export const ProgressModel = model<IProgressDocument>('Progress', progressSchema);
