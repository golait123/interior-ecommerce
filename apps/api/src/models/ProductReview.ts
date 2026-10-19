import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewMedia {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  caption?: string;
}

export interface IReviewReply {
  author: string;
  role: 'ADMIN' | 'STORE_MANAGER' | 'DESIGNER';
  message: string;
  createdAt: Date;
}

export interface IProductReview extends Document {
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  productType?: string;
  media: IReviewMedia[];
  attributes?: {
    quality?: number;
    packaging?: number;
    plantHealth?: number;
    easyToInstall?: number;
  };
  helpfulVotes: string[]; // array of userIds
  helpfulCount: number;
  replies: IReviewReply[];
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>(
  {
    productId: { type: String, required: true, index: true },
    productName: { type: String },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: false },
    productType: { type: String },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' },
        caption: { type: String }
      }
    ],
    attributes: {
      quality: { type: Number, min: 1, max: 5 },
      packaging: { type: Number, min: 1, max: 5 },
      plantHealth: { type: Number, min: 1, max: 5 },
      easyToInstall: { type: Number, min: 1, max: 5 }
    },
    helpfulVotes: [{ type: String }],
    helpfulCount: { type: Number, default: 0 },
    replies: [
      {
        author: { type: String, required: true },
        role: { type: String, enum: ['ADMIN', 'STORE_MANAGER', 'DESIGNER'], default: 'ADMIN' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    isApproved: { type: Boolean, default: true, index: true }
  },
  {
    timestamps: true
  }
);

ProductReviewSchema.index({ productId: 1, isApproved: 1, rating: -1, createdAt: -1 });

export const ProductReview = mongoose.models.ProductReview ||
  mongoose.model<IProductReview>('ProductReview', ProductReviewSchema);

export default ProductReview;
