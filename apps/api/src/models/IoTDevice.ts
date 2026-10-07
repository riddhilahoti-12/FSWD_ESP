import mongoose, { Document, Schema } from 'mongoose';
import { IoTDeviceStatus, IoTDeviceType } from '@missionx/shared';

export interface IIoTDevice extends Document {
  deviceId: string;
  missionId: string;
  name: string;
  type: IoTDeviceType;
  status: IoTDeviceStatus;
  metadata?: Record<string, any>;
  lastTelemetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IoTDeviceSchema = new Schema<IIoTDevice>(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    missionId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['ESP32', 'SENSOR', 'ACTUATOR', 'SIMULATOR'],
      default: 'SIMULATOR',
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'SIMULATED', 'ERROR'],
      default: 'SIMULATED',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastTelemetryAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const IoTDevice = mongoose.model<IIoTDevice>('IoTDevice', IoTDeviceSchema);
