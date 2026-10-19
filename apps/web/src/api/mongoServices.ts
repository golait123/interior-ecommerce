import { api, unwrap } from './client';

export interface CustomizerDesignItem {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ReviewMedia {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  caption?: string;
}

export interface ProductReviewItem {
  _id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  productType?: string;
  media: ReviewMedia[];
  attributes?: {
    quality?: number;
    packaging?: number;
    plantHealth?: number;
    easyToInstall?: number;
  };
  helpfulCount: number;
  hasVoted?: boolean;
  replies: Array<{
    author: string;
    role: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface ReviewsResponse {
  items: ProductReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    attributes: {
      quality: number;
      packaging: number;
      plantHealth: number;
      easyToInstall: number;
    };
    mediaCount: number;
  };
}

export const mongoApi = {
  // --- CUSTOMIZER DESIGNS (MONGODB) ---
  saveDesign: (data: Partial<CustomizerDesignItem>) =>
    api.post('/customizer-designs', data).then(unwrap<CustomizerDesignItem>),

  listDesigns: (params?: { designType?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/customizer-designs', { params }).then(unwrap<{ items: CustomizerDesignItem[]; total: number; totalPages: number }>),

  getDesign: (id: string) =>
    api.get(`/customizer-designs/${id}`).then(unwrap<CustomizerDesignItem>),

  getSharedDesign: (shareSlug: string) =>
    api.get(`/customizer-designs/share/${shareSlug}`).then(unwrap<CustomizerDesignItem>),

  updateDesign: (id: string, updates: Partial<CustomizerDesignItem>) =>
    api.put(`/customizer-designs/${id}`, updates).then(unwrap<CustomizerDesignItem>),

  deleteDesign: (id: string) =>
    api.delete(`/customizer-designs/${id}`).then(unwrap<{ success: boolean }>),

  // --- REVIEWS & RATINGS (MONGODB) ---
  getProductReviews: (productId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/reviews/product/${productId}`, { params }).then(unwrap<ReviewsResponse>),

  createReview: (reviewData: Partial<ProductReviewItem>) =>
    api.post('/reviews', reviewData).then(unwrap<ProductReviewItem>),

  toggleHelpful: (reviewId: string) =>
    api.post(`/reviews/${reviewId}/helpful`, {}).then(unwrap<{ helpfulCount: number; hasVoted: boolean }>),

  getRecentReviews: (limit = 6) =>
    api.get('/reviews/recent', { params: { limit } }).then(unwrap<ProductReviewItem[]>),

  // --- TELEMETRY & LOGS (MONGODB) ---
  logEvent: (eventType: string, details?: Record<string, any>, entityType?: string, entityId?: string) =>
    api.post('/activity-logs/event', {
      eventType,
      details,
      entityType,
      entityId,
      page: window.location.pathname
    }).then(unwrap<any>).catch(() => {})
};
