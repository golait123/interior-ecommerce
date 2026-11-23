export interface ARTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface ARDeviceInfo {
  userAgent?: string;
  platform?: string;
  isXRSupported: boolean;
  screenResolution?: string;
  mode: 'WEBXR_IMMERSIVE' | 'CAMERA_SIMULATION' | 'QUICK_LOOK' | 'SCENE_VIEWER';
}

export interface ARInteractions {
  placementsCount: number;
  rotationsCount: number;
  scaleChangesCount: number;
  snapshotsCount: number;
}

export interface ARDimensions {
  widthMeters: number;
  heightMeters: number;
  depthMeters: number;
  widthFeet: number;
  heightFeet: number;
  depthFeet: number;
}

export interface ARProductConfig {
  enabled: boolean;
  placementType: 'floor' | 'wall' | 'tabletop';
  dimensions: ARDimensions;
  modelType: 'procedural' | 'gltf';
  geometryType: 'sofa' | 'chair' | 'table' | 'vase' | 'plant' | 'wall-art' | 'lamp' | 'decor';
  primaryColor: string;
}

export interface PlacedARItem {
  id: string;
  productId: string;
  productName: string;
  category?: string;
  price: number;
  imageUrl: string;
  geometryType: ARProductConfig['geometryType'];
  primaryColor: string;
  dimensions: ARDimensions;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface ARSessionData {
  sessionId: string;
  userId?: string;
  productId: string;
  productName: string;
  modelUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  deviceInfo: ARDeviceInfo;
  sessionDurationSeconds: number;
  interactions: ARInteractions;
  transform: ARTransform;
  status: 'initiated' | 'active' | 'placed' | 'ended';
  cartAdded: boolean;
  snapshotUrl?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ARSessionMetrics {
  totalSessions: number;
  placedCount: number;
  placementRate: number;
  cartConversionCount: number;
  cartConversionRate: number;
}

export interface ARCapabilities {
  webxrSupported: boolean;
  hitTestSupported: boolean;
  cameraAvailable: boolean;
  quickLookSupported: boolean;
  sceneViewerSupported: boolean;
  preferredMode: 'WEBXR_IMMERSIVE' | 'CAMERA_SIMULATION' | 'QUICK_LOOK' | 'SCENE_VIEWER';
}
