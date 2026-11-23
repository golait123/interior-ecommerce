import mongoose, { Schema, Document } from 'mongoose';

export interface IARSession extends Document {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  productId: string;
  productName: string;
  modelUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  deviceInfo: {
    userAgent?: string;
    platform?: string;
    isXRSupported: boolean;
    screenResolution?: string;
    mode: 'WEBXR_IMMERSIVE' | 'CAMERA_SIMULATION' | 'QUICK_LOOK' | 'SCENE_VIEWER';
  };
  sessionDurationSeconds: number;
  interactions: {
    placementsCount: number;
    rotationsCount: number;
    scaleChangesCount: number;
    snapshotsCount: number;
  };
  transform: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  status: 'initiated' | 'active' | 'placed' | 'ended';
  cartAdded: boolean;
  snapshotUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ARSessionSchema = new Schema<IARSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    userEmail: { type: String },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    modelUrl: { type: String },
    dimensions: {
      width: { type: Number, default: 1.0 },
      height: { type: Number, default: 0.8 },
      depth: { type: Number, default: 0.9 },
      unit: { type: String, default: 'm' }
    },
    deviceInfo: {
      userAgent: { type: String },
      platform: { type: String },
      isXRSupported: { type: Boolean, default: false },
      screenResolution: { type: String },
      mode: {
        type: String,
        enum: ['WEBXR_IMMERSIVE', 'CAMERA_SIMULATION', 'QUICK_LOOK', 'SCENE_VIEWER'],
        default: 'CAMERA_SIMULATION'
      }
    },
    sessionDurationSeconds: { type: Number, default: 0 },
    interactions: {
      placementsCount: { type: Number, default: 0 },
      rotationsCount: { type: Number, default: 0 },
      scaleChangesCount: { type: Number, default: 0 },
      snapshotsCount: { type: Number, default: 0 }
    },
    transform: {
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: -1.5 }
      },
      rotation: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
      },
      scale: {
        x: { type: Number, default: 1.0 },
        y: { type: Number, default: 1.0 },
        z: { type: Number, default: 1.0 }
      }
    },
    status: {
      type: String,
      enum: ['initiated', 'active', 'placed', 'ended'],
      default: 'initiated',
      index: true
    },
    cartAdded: { type: Boolean, default: false },
    snapshotUrl: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true
  }
);

export const ARSession = mongoose.models.ARSession || mongoose.model<IARSession>('ARSession', ARSessionSchema);
export default ARSession;
