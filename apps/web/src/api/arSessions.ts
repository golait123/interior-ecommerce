import { api, unwrap } from './client';
import { ARSessionData, ARSessionMetrics } from '../types/ar';

export interface CreateARSessionInput {
  sessionId?: string;
  productId: string;
  productName: string;
  modelUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    isXRSupported?: boolean;
    screenResolution?: string;
    mode?: 'WEBXR_IMMERSIVE' | 'CAMERA_SIMULATION' | 'QUICK_LOOK' | 'SCENE_VIEWER';
  };
  transform?: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  };
  status?: 'initiated' | 'active' | 'placed' | 'ended';
  metadata?: Record<string, any>;
}

export interface UpdateARSessionInput {
  sessionDurationSeconds?: number;
  interactions?: {
    placementsCount?: number;
    rotationsCount?: number;
    scaleChangesCount?: number;
    snapshotsCount?: number;
  };
  transform?: {
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    scale?: { x?: number; y?: number; z?: number };
  };
  status?: 'initiated' | 'active' | 'placed' | 'ended';
  cartAdded?: boolean;
  snapshotUrl?: string;
  metadata?: Record<string, any>;
}

export interface ARSessionListResponse {
  sessions: ARSessionData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  metrics: ARSessionMetrics;
}

export const arSessionsApi = {
  create: (data: CreateARSessionInput) =>
    api.post('/ar-sessions', data).then(unwrap<ARSessionData>),

  get: (id: string) =>
    api.get(`/ar-sessions/${id}`).then(unwrap<ARSessionData>),

  update: (id: string, data: UpdateARSessionInput) =>
    api.put(`/ar-sessions/${id}`, data).then(unwrap<ARSessionData>),

  list: (params?: { productId?: string; status?: string; limit?: number; page?: number }) =>
    api.get('/ar-sessions', { params }).then(unwrap<ARSessionListResponse>),

  delete: (id: string) =>
    api.delete(`/ar-sessions/${id}`).then(unwrap<{ success: boolean; message: string }>),
};
