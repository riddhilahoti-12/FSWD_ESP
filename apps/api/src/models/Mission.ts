import { Schema, model, Document, Types } from 'mongoose';
import { MissionDifficulty } from '@missionx/shared';

export interface IMissionDocument extends Document {
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
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const missionSchema = new Schema<IMissionDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    briefing: {
      type: String,
      required: true,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    estimatedDuration: {
      type: String,
      default: '10–15 min',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const MissionModel = model<IMissionDocument>('Mission', missionSchema);
