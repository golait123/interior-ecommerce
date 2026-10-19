import mongoose, { Schema, Document } from 'mongoose';

export interface IUserActivityLog extends Document {
  userId?: string;
  sessionId?: string;
  eventType: 
    | 'CUSTOMIZER_OPEN'
    | 'CUSTOMIZER_STEP_CHANGED'
    | 'CUSTOMIZER_ADDON_TOGGLED'
    | 'CUSTOMIZER_COMMISSIONED'
    | 'WALLPAPER_CALCULATION'
    | 'VISUALIZER_ROOM_GENERATED'
    | 'VISUALIZER_HOTSPOT_CLICKED'
    | 'PRODUCT_VIEWED'
    | 'SEARCH_PERFORMED'
    | 'CART_MODIFIED';
  entityType?: string;
  entityId?: string;
  page?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const UserActivityLogSchema = new Schema<IUserActivityLog>(
  {
    userId: { type: String, index: true },
    sessionId: { type: String, index: true },
    eventType: { type: String, required: true, index: true },
    entityType: { type: String },
    entityId: { type: String },
    page: { type: String },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 } // 90 days TTL index in MongoDB
  }
);

UserActivityLogSchema.index({ eventType: 1, createdAt: -1 });
UserActivityLogSchema.index({ userId: 1, createdAt: -1 });

export const UserActivityLog = mongoose.models.UserActivityLog ||
  mongoose.model<IUserActivityLog>('UserActivityLog', UserActivityLogSchema);

export default UserActivityLog;
