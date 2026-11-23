import { useState, useEffect, useRef, useCallback } from 'react';
import { ARCapabilities, ARTransform, ARInteractions, ARSessionData, ARDimensions, ARProductConfig } from '../types/ar';
import { detectARCapabilities } from '../services/webxr';
import { arSessionsApi } from '../api/arSessions';
import { Product } from '../api/products';

export interface UseARReturn {
  capabilities: ARCapabilities | null;
  activeSession: ARSessionData | null;
  isSessionActive: boolean;
  isPlaced: boolean;
  transform: ARTransform;
  interactions: ARInteractions;
  elapsedSeconds: number;
  startSession: (product: Product, customDimensions?: Partial<ARDimensions>) => Promise<ARSessionData | null>;
  placeModel: (position?: { x: number; y: number; z: number }) => void;
  rotateModel: (deltaDegrees: number) => void;
  scaleModel: (scaleFactor: number) => void;
  resetToTrueScale: () => void;
  captureSnapshot: () => void;
  markCartAdded: () => Promise<void>;
  endSession: () => Promise<void>;
}

export function useAR(initialProduct?: Product | null): UseARReturn {
  const [capabilities, setCapabilities] = useState<ARCapabilities | null>(null);
  const [activeSession, setActiveSession] = useState<ARSessionData | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isPlaced, setIsPlaced] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const [transform, setTransform] = useState<ARTransform>({
    position: { x: 0, y: 0, z: -1.6 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1.0, y: 1.0, z: 1.0 }
  });

  const [interactions, setInteractions] = useState<ARInteractions>({
    placementsCount: 0,
    rotationsCount: 0,
    scaleChangesCount: 0,
    snapshotsCount: 0
  });

  const activeProductRef = useRef<Product | null>(initialProduct || null);
  const timerRef = useRef<number | null>(null);
  const sessionDataRef = useRef<ARSessionData | null>(null);
  const interactionsRef = useRef<ARInteractions>(interactions);
  const transformRef = useRef<ARTransform>(transform);

  interactionsRef.current = interactions;
  transformRef.current = transform;

  // Detect AR capabilities on mount
  useEffect(() => {
    detectARCapabilities().then(caps => {
      setCapabilities(caps);
    });
  }, []);

  // Timer interval for active session duration
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  // Periodic heartbeat sync to backend (every 10 seconds if active)
  useEffect(() => {
    if (!isSessionActive || !activeSession?.sessionId) return;

    const syncInterval = window.setInterval(() => {
      arSessionsApi.update(activeSession.sessionId, {
        sessionDurationSeconds: elapsedSeconds,
        interactions: interactionsRef.current,
        transform: transformRef.current
      }).catch(() => {});
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [isSessionActive, activeSession?.sessionId, elapsedSeconds]);

  // Start AR session
  const startSession = useCallback(async (product: Product, customDimensions?: Partial<ARDimensions>) => {
    activeProductRef.current = product;
    setIsSessionActive(true);
    setIsPlaced(false);
    setElapsedSeconds(0);

    const arCfg = (product as any).arConfig as ARProductConfig | undefined;
    const defaultDims = arCfg?.dimensions || {
      widthMeters: 1.2,
      heightMeters: 0.85,
      depthMeters: 0.8,
      widthFeet: 4.0,
      heightFeet: 2.8,
      depthFeet: 2.6
    };

    const finalDims = { ...defaultDims, ...customDimensions };

    const initialPos = { x: 0, y: 0, z: -1.6 };
    const initialRot = { x: 0, y: 0, z: 0 };
    const initialScale = { x: 1.0, y: 1.0, z: 1.0 };

    setTransform({ position: initialPos, rotation: initialRot, scale: initialScale });
    setInteractions({
      placementsCount: 0,
      rotationsCount: 0,
      scaleChangesCount: 0,
      snapshotsCount: 0
    });

    try {
      const caps = capabilities || await detectARCapabilities();
      const session = await arSessionsApi.create({
        productId: product.id,
        productName: product.name,
        modelUrl: product.images?.[0] || '',
        dimensions: {
          width: finalDims.widthMeters,
          height: finalDims.heightMeters,
          depth: finalDims.depthMeters,
          unit: 'm'
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          isXRSupported: caps.webxrSupported,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          mode: caps.preferredMode
        },
        transform: { position: initialPos, rotation: initialRot, scale: initialScale },
        status: 'active'
      });

      sessionDataRef.current = session;
      setActiveSession(session);
      return session;
    } catch (err) {
      console.warn('Failed to register AR session with backend, continuing in local mode:', err);
      const fallbackSession: ARSessionData = {
        sessionId: `local-ar-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        deviceInfo: {
          isXRSupported: false,
          mode: 'CAMERA_SIMULATION'
        },
        sessionDurationSeconds: 0,
        interactions: { placementsCount: 0, rotationsCount: 0, scaleChangesCount: 0, snapshotsCount: 0 },
        transform: { position: initialPos, rotation: initialRot, scale: initialScale },
        status: 'active',
        cartAdded: false
      };
      sessionDataRef.current = fallbackSession;
      setActiveSession(fallbackSession);
      return fallbackSession;
    }
  }, [capabilities]);

  // Place model on detected surface
  const placeModel = useCallback((position?: { x: number; y: number; z: number }) => {
    setIsPlaced(true);
    setInteractions(prev => {
      const next = { ...prev, placementsCount: prev.placementsCount + 1 };
      interactionsRef.current = next;
      return next;
    });

    if (position) {
      setTransform(prev => {
        const next = { ...prev, position };
        transformRef.current = next;
        return next;
      });
    }

    if (activeSession?.sessionId) {
      arSessionsApi.update(activeSession.sessionId, {
        status: 'placed',
        interactions: {
          ...interactionsRef.current,
          placementsCount: interactionsRef.current.placementsCount + 1
        },
        transform: position ? { position } : undefined
      }).catch(() => {});
    }
  }, [activeSession?.sessionId]);

  // Rotate model around Y axis
  const rotateModel = useCallback((deltaDegrees: number) => {
    setTransform(prev => {
      const nextRotY = (prev.rotation.y + (deltaDegrees * Math.PI) / 180) % (Math.PI * 2);
      const next = {
        ...prev,
        rotation: { ...prev.rotation, y: nextRotY }
      };
      transformRef.current = next;
      return next;
    });

    setInteractions(prev => {
      const next = { ...prev, rotationsCount: prev.rotationsCount + 1 };
      interactionsRef.current = next;
      return next;
    });
  }, []);

  // Scale model (relative factor e.g. 1.05 or 0.95)
  const scaleModel = useCallback((scaleFactor: number) => {
    setTransform(prev => {
      const clamped = Math.max(0.4, Math.min(2.5, prev.scale.x * scaleFactor));
      const next = {
        ...prev,
        scale: { x: clamped, y: clamped, z: clamped }
      };
      transformRef.current = next;
      return next;
    });

    setInteractions(prev => {
      const next = { ...prev, scaleChangesCount: prev.scaleChangesCount + 1 };
      interactionsRef.current = next;
      return next;
    });
  }, []);

  // Reset to true 1:1 physical real-world scale
  const resetToTrueScale = useCallback(() => {
    setTransform(prev => {
      const next = {
        ...prev,
        scale: { x: 1.0, y: 1.0, z: 1.0 }
      };
      transformRef.current = next;
      return next;
    });
  }, []);

  // Record snapshot capture
  const captureSnapshot = useCallback(() => {
    setInteractions(prev => {
      const next = { ...prev, snapshotsCount: prev.snapshotsCount + 1 };
      interactionsRef.current = next;
      return next;
    });

    if (activeSession?.sessionId) {
      arSessionsApi.update(activeSession.sessionId, {
        interactions: {
          ...interactionsRef.current,
          snapshotsCount: interactionsRef.current.snapshotsCount + 1
        }
      }).catch(() => {});
    }
  }, [activeSession?.sessionId]);

  // Mark added to cart
  const markCartAdded = useCallback(async () => {
    if (activeSession?.sessionId) {
      await arSessionsApi.update(activeSession.sessionId, {
        cartAdded: true,
        sessionDurationSeconds: elapsedSeconds
      }).catch(() => {});
    }
    setActiveSession(prev => prev ? { ...prev, cartAdded: true } : null);
  }, [activeSession?.sessionId, elapsedSeconds]);

  // End AR session
  const endSession = useCallback(async () => {
    setIsSessionActive(false);
    if (activeSession?.sessionId) {
      await arSessionsApi.update(activeSession.sessionId, {
        status: 'ended',
        sessionDurationSeconds: elapsedSeconds,
        interactions: interactionsRef.current,
        transform: transformRef.current
      }).catch(() => {});
    }
  }, [activeSession?.sessionId, elapsedSeconds]);

  return {
    capabilities,
    activeSession,
    isSessionActive,
    isPlaced,
    transform,
    interactions,
    elapsedSeconds,
    startSession,
    placeModel,
    rotateModel,
    scaleModel,
    resetToTrueScale,
    captureSnapshot,
    markCartAdded,
    endSession
  };
}
