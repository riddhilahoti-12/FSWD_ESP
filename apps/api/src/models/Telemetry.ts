import mongoose, { Document, Schema } from 'mongoose';
import { SensorReading, ActuatorState, SimulationMode } from '@missionx/shared';

export interface ITelemetry extends Document {
  deviceId: string;
  missionId: string;
  timestamp: Date;
  sensors: SensorReading;
  actuators: ActuatorState;
  simulationMode?: SimulationMode;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const TelemetrySchema = new Schema<ITelemetry>(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    missionId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sensors: {
      type: Schema.Types.Mixed,
      required: true,
    },
    actuators: {
      type: Schema.Types.Mixed,
      required: true,
    },
    simulationMode: {
      type: String,
      default: 'NORMAL',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only immutable log
  }
);

// Compound indexes for rapid retrieval of latest telemetry and historical time series
TelemetrySchema.index({ missionId: 1, timestamp: -1 });
TelemetrySchema.index({ deviceId: 1, timestamp: -1 });

export const Telemetry = mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);
