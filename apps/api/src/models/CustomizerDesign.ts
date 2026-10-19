import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomizerDesign extends Document {
  userId?: string;
  userEmail?: string;
  title: string;
  designType: 'NURSERY_GARDEN' | 'CUSTOM_WALLPAPER' | 'ROOM_VISUALIZER' | 'ROOM_PANORAMA';
  status: 'DRAFT' | 'SAVED' | 'ORDERED' | 'ARCHIVED';
  shareSlug: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  previewImage?: string;
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
    areaSqFt?: number;
    unit?: string;
  };
  totalEstimatedCost: number;
  currency: string;
  metadata: Record<string, any>;
  tags: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomizerDesignSchema = new Schema<ICustomizerDesign>(
  {
    userId: { type: String, index: true },
    userEmail: { type: String },
    title: { type: String, required: true, trim: true },
    designType: {
      type: String,
      required: true,
      enum: ['NURSERY_GARDEN', 'CUSTOM_WALLPAPER', 'ROOM_VISUALIZER', 'ROOM_PANORAMA'],
      index: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SAVED', 'ORDERED', 'ARCHIVED'],
      default: 'SAVED',
      index: true
    },
    shareSlug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    isPublic: { type: Boolean, default: false },
    thumbnailUrl: { type: String },
    previewImage: { type: String },
    dimensions: {
      width: { type: Number },
      length: { type: Number },
      height: { type: Number },
      areaSqFt: { type: Number },
      unit: { type: String, default: 'ft' }
    },
    totalEstimatedCost: { type: Number, default: 0 },
    currency: { type: String, default: '₹' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    tags: [{ type: String }],
    version: { type: Number, default: 1 }
  },
  {
    timestamps: true
  }
);

// Compound indexes for user dashboard & fast search
CustomizerDesignSchema.index({ userId: 1, designType: 1, createdAt: -1 });
CustomizerDesignSchema.index({ isPublic: 1, createdAt: -1 });

export const CustomizerDesign = mongoose.models.CustomizerDesign || 
  mongoose.model<ICustomizerDesign>('CustomizerDesign', CustomizerDesignSchema);

export default CustomizerDesign;
