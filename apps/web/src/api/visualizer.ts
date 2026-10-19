import { api, unwrap } from './client';
import { Product } from './products';

export interface Hotspot {
  productId: string;
  name: string;
  category?: string;
  price: number;
  image: string;
  placement?: string;
  role?: string;
  position: {
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    yaw: number; // degrees (-180 to 180)
    pitch: number; // degrees (-90 to 90)
  };
}

export interface WallpaperCostEstimate {
  productId: string;
  productName: string;
  wallWidth: number;
  wallHeight: number;
  areaSqFt: number;
  billableAreaSqFt: number;
  pricePerSqFt: number;
  materialCost: number;
  tax: number;
  total: number;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface RoomAnalysisResponse {
  designType: 'PANORAMA' | 'ROOM_PHOTO';
  mode: 'AUTO' | 'MANUAL';
  roomType: string;
  dimensions: {
    width: number;
    height: number;
    length: number;
    primaryWallAreaSqFt: number;
    totalWallAreaSqFt: number;
  };
  detectedStyle: string;
  colorPalette: ColorSwatch[];
  wallpaperCostEstimate: WallpaperCostEstimate | null;
  hotspots: Hotspot[];
  products: Product[];
  totalBundlePrice: number;
  currency: string;
}

export interface AnalyzeRequest {
  designType: 'PANORAMA' | 'ROOM_PHOTO';
  fileUrl?: string;
  fileName?: string;
  mode: 'AUTO' | 'MANUAL';
  selectedProductIds?: string[];
  roomType?: string;
  dimensions?: {
    width?: number;
    height?: number;
    length?: number;
    unit?: 'ft' | 'm';
  };
}

export const visualizerApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('designFile', file);
    return api.post('/visualizer/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(unwrap<{ fileUrl: string; fileName: string; fileType: string; fileSize: number }>);
  },

  analyze: (data: AnalyzeRequest) =>
    api.post('/visualizer/analyze', data).then(unwrap<RoomAnalysisResponse>),

  generate360: (params?: { roomType?: string; style?: string; wallpaper?: string; customPrompt?: string; dimensions?: any }) =>
    api.post('/visualizer/generate-360', params || {}).then(unwrap<{ imageUrl: string; prompt: string; model?: string; source?: string; resolution: string }>),
};

