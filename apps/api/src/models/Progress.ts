import { Schema, model, Document, Types } from 'mongoose';
import { ProgressStatus } from '@missionx/shared';

export interface IProgressDocument extends Document {
  studentId: Types.ObjectId;
  missionId: Types.ObjectId;
  currentStage: number;
  completedStages: number[];
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
    currentStage: {
      type: Number,
      default: 1,
    },
    completedStages: {
      type: [Number],
      default: [],
    },
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
