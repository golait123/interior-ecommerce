import mongoose, { Schema, Document } from 'mongoose';

export interface IAiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggestedProducts?: string[];
  generatedImages?: string[];
  visualizerHotspots?: any[];
  timestamp: Date;
}

export interface IAiChatSession extends Document {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  sessionTitle: string;
  roomContext: {
    roomType?: string;
    dimensions?: string;
    currentStyle?: string;
    targetStyle?: string;
    budget?: string;
  };
  messages: IAiChatMessage[];
  activeModel: string;
  totalTokensUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const AiChatSessionSchema = new Schema<IAiChatSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    userEmail: { type: String },
    sessionTitle: { type: String, default: 'Interior & Botanical Design Consultation' },
    roomContext: {
      roomType: { type: String },
      dimensions: { type: String },
      currentStyle: { type: String },
      targetStyle: { type: String },
      budget: { type: String }
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        suggestedProducts: [{ type: String }],
        generatedImages: [{ type: String }],
        visualizerHotspots: [{ type: Schema.Types.Mixed }],
        timestamp: { type: Date, default: Date.now }
      }
    ],
    activeModel: { type: String, default: 'gemini-3.7-flash' },
    totalTokensUsed: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

AiChatSessionSchema.index({ userId: 1, updatedAt: -1 });

export const AiChatSession = mongoose.models.AiChatSession ||
  mongoose.model<IAiChatSession>('AiChatSession', AiChatSessionSchema);

export default AiChatSession;
