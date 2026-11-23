import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  X, 
  RotateCw, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Camera, 
  ShoppingBag, 
  Check, 
  Sliders, 
  Info, 
  QrCode, 
  Sparkles, 
  Smartphone, 
  Move, 
  Eye, 
  Layers, 
  ChevronRight, 
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertCircle,
  Share2,
  BarChart3,
  Plus,
  Trash2
} from 'lucide-react';
import { Product } from '../api/products';
import { ARProductConfig, ARDimensions, PlacedARItem } from '../types/ar';
import { useAR } from '../hooks/useAR';
import { startCameraVideo, stopCameraVideo, createReticle, buildRealisticProceduralModel } from '../services/webxr';
import { useCart } from '../contexts/CartContext';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

interface ARViewerProps {
  product: Product;
  catalog?: Product[];
  onSelectProduct?: (product: Product) => void;
  onClose: () => void;
  isEmbedded?: boolean;
  onToggleFullscreen?: () => void;
  roomDimensions?: { width: number; height: number; length: number };
}

export function ARViewer({
  product,
  catalog = [],
  onSelectProduct,
  onClose,
  isEmbedded = false,
  onToggleFullscreen,
  roomDimensions
}: ARViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { addItem } = useCart();
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(!isEmbedded);

  // Multi-Product Scene Placements (Roadmap Feature)
  const [placedSceneItems, setPlacedSceneItems] = useState<PlacedARItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Active interaction mode: Move across floor, Rotate 360°, Scale dimensions
  const [interactionMode, setInteractionMode] = useState<'MOVE' | 'ROTATE' | 'SCALE'>('MOVE');

  // Height offset in meters
  const [elevationMeters, setElevationMeters] = useState<number>(0);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Pinch-to-scale touch tracking
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialTouchScaleRef = useRef<number>(1.0);

  // Hook for AR session lifecycle and telemetry
  const {
    capabilities,
    activeSession,
    isPlaced,
    transform,
    interactions,
    elapsedSeconds,
    startSession,
    placeModel,
    moveModel,
    rotateModel,
    scaleModel,
    resetToTrueScale,
    captureSnapshot,
    markCartAdded,
    endSession
  } = useAR(product);

  // Three.js References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const placedMeshesGroupRef = useRef<THREE.Group | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const xrSessionRef = useRef<any>(null);
  const hitTestSourceRef = useRef<any>(null);

  // Floor plane raycasting & drag interaction tracking
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerDownTimeRef = useRef<number>(0);
  const floorPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());
  const intersectPointRef = useRef(new THREE.Vector3());

  // Get product AR specs
  const arConfig = (product as any).arConfig as ARProductConfig | undefined;
  const dimensions: ARDimensions = arConfig?.dimensions || {
    widthMeters: 1.2,
    heightMeters: 0.85,
    depthMeters: 0.8,
    widthFeet: 4.0,
    heightFeet: 2.8,
    depthFeet: 2.6
  };

  // Format session timer display
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate QR Code for mobile device handoff
  useEffect(() => {
    const mobileArUrl = `${window.location.origin}/room-studio?mode=ar&product=${product.id}`;
    QRCode.toDataURL(mobileArUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0B2E5B',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation failed:', err));
  }, [product.id]);

  // Initialize AR session in backend on product change
  useEffect(() => {
    startSession(product);
    return () => {
      endSession();
    };
  }, [product.id]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Create Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Perspective Camera (Looking naturally at the room floor)
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      25
    );
    camera.position.set(0, 1.25, 1.8);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with XR support and alpha transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    rendererRef.current = renderer;

    // 4. Lighting Rig (Directional Sun + Ambient Sky + Floor Fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    dirLight.position.set(2, 4, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 15;
    scene.add(dirLight);

    const fillLight = new THREE.PointLight(0x8ec5ff, 0.6);
    fillLight.position.set(-2, 1.5, -1);
    scene.add(fillLight);

    // 5. Reticle for Surface Tracking
    const reticle = createReticle();
    scene.add(reticle);
    reticleRef.current = reticle;

    // 6. Active 3D Furniture Model Group
    const modelGroup = new THREE.Group();
    const furnitureMesh = buildRealisticProceduralModel(
      arConfig?.geometryType || 'table',
      arConfig?.primaryColor || '#0B2E5B',
      dimensions
    );
    modelGroup.add(furnitureMesh);

    // Glowing ground footprint ring indicating 3D object floor footprint
    const footprintGeo = new THREE.RingGeometry(0.24, 0.28, 32).rotateX(-Math.PI / 2);
    const footprintMat = new THREE.MeshBasicMaterial({
      color: 0x2D8CFF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const footprint = new THREE.Mesh(footprintGeo, footprintMat);
    footprint.position.y = 0.005;
    modelGroup.add(footprint);

    modelGroup.position.set(transform.position.x, transform.position.y, transform.position.z);
    modelGroup.rotation.y = transform.rotation.y;
    modelGroup.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 7. Group for Multi-Product Placed Items
    const placedGroup = new THREE.Group();
    scene.add(placedGroup);
    placedMeshesGroupRef.current = placedGroup;

    // 8. Virtual Shadow Receiver Ground Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(8, 8).rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 9. Start Camera Stream if not running full WebXR hardware session
    let cameraVideo: HTMLVideoElement | null = null;
    startCameraVideo().then(v => {
      cameraVideo = v;
      if (videoRef.current && v) {
        videoRef.current.srcObject = v.srcObject;
      }
    });

    // 10. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 11. Animation / Render Loop
    const renderLoop = (time: number, frame?: any) => {
      if (frame && hitTestSourceRef.current && xrSessionRef.current) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
        if (hitTestResults.length > 0 && reticle) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
          reticle.matrix.decompose(reticle.position, reticle.quaternion, reticle.scale);
        } else if (reticle) {
          reticle.visible = false;
        }
      } else if (reticle && modelGroupRef.current) {
        reticle.visible = true;
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      stopCameraVideo(cameraVideo);
      if (xrSessionRef.current) {
        xrSessionRef.current.end().catch(() => {});
      }
      renderer.dispose();
    };
  }, [product.id, arConfig?.geometryType]);

  // Sync Transform updates to Three.js Active Model Group
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.position.set(
      transform.position.x,
      transform.position.y + elevationMeters,
      transform.position.z
    );
    modelGroupRef.current.rotation.y = transform.rotation.y;
    modelGroupRef.current.scale.set(
      transform.scale.x,
      transform.scale.y,
      transform.scale.z
    );
  }, [transform, elevationMeters]);

  // Re-render multi-product placed items into scene
  useEffect(() => {
    const group = placedMeshesGroupRef.current;
    if (!group) return;

    // Clear existing placed meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Add each placed item
    placedSceneItems.forEach(item => {
      const itemGroup = new THREE.Group();
      const mesh = buildRealisticProceduralModel(item.geometryType, item.primaryColor, item.dimensions);
      itemGroup.add(mesh);
      itemGroup.position.set(item.position.x, item.position.y, item.position.z);
      itemGroup.rotation.y = item.rotation.y;
      itemGroup.scale.set(item.scale.x, item.scale.y, item.scale.z);
      group.add(itemGroup);
    });
  }, [placedSceneItems]);

  // Helper to project screen coordinate onto ground floor plane
  const getFloorIntersection = (clientX: number, clientY: number): THREE.Vector3 | null => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas || !camera) return null;
    const rect = canvas.getBoundingClientRect();
    mouseVecRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVecRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseVecRef.current, camera);
    if (raycasterRef.current.ray.intersectPlane(floorPlaneRef.current, intersectPointRef.current)) {
      return intersectPointRef.current;
    }
    return null;
  };

  // Handle Touch/Mouse Drag & Tap to Place on Ground Plane
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    pointerDownTimeRef.current = Date.now();
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) {
      // Hover tracking for reticle placement guide
      const pt = getFloorIntersection(e.clientX, e.clientY);
      if (pt && reticleRef.current && !xrSessionRef.current) {
        reticleRef.current.position.set(pt.x, 0.005, pt.z);
      }
      return;
    }

    const deltaX = e.clientX - previousPointerPosRef.current.x;
    const deltaY = e.clientY - previousPointerPosRef.current.y;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };

    if (interactionMode === 'MOVE') {
      const pt = getFloorIntersection(e.clientX, e.clientY);
      if (pt) {
        const clampedX = Math.max(-2.5, Math.min(2.5, pt.x));
        const clampedZ = Math.max(-3.5, Math.min(0.8, pt.z));
        moveModel({ x: clampedX, y: 0, z: clampedZ });
        if (reticleRef.current && !xrSessionRef.current) {
          reticleRef.current.position.set(clampedX, 0.005, clampedZ);
        }
      }
    } else if (interactionMode === 'ROTATE') {
      rotateModel(deltaX * 0.75);
    } else if (interactionMode === 'SCALE') {
      const factor = 1 - (deltaY * 0.006);
      scaleModel(factor);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
    const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
    const duration = Date.now() - pointerDownTimeRef.current;

    // Quick Tap / Click on floor plane: place/relocate 3D product
    if (dx < 8 && dy < 8 && duration < 380) {
      const pt = getFloorIntersection(e.clientX, e.clientY);
      if (pt) {
        const clampedX = Math.max(-2.5, Math.min(2.5, pt.x));
        const clampedZ = Math.max(-3.5, Math.min(0.8, pt.z));
        placeModel({ x: clampedX, y: 0, z: clampedZ });
        if (reticleRef.current && !xrSessionRef.current) {
          reticleRef.current.position.set(clampedX, 0.005, clampedZ);
        }
        toast.success(`Positioned ${product.name} on room floor!`, { id: 'place-tap' });
      }
    } else if (interactionMode === 'MOVE') {
      placeModel(transform.position);
    }

    isDraggingRef.current = false;
  };

  // Pinch-to-Scale Multi-Touch Support (Advanced AR gesture)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistanceRef.current = dist;
      initialTouchScaleRef.current = transform.scale.x;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / initialTouchDistanceRef.current;
      scaleModel(ratio * (initialTouchScaleRef.current / transform.scale.x));
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
  };

  // Launch Native WebXR Immersive Session
  const handleLaunchImmersiveXR = async () => {
    if (typeof navigator === 'undefined' || !(navigator as any).xr) {
      toast.error('WebXR immersive-ar is not supported on this browser/device.');
      return;
    }

    try {
      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay', 'light-estimation'],
        domOverlay: { root: containerRef.current }
      });

      xrSessionRef.current = session;
      if (rendererRef.current) {
        await rendererRef.current.xr.setSession(session);
      }

      const viewerSpace = await session.requestReferenceSpace('viewer');
      hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace });

      session.addEventListener('select', () => {
        if (reticleRef.current?.visible) {
          const pos = new THREE.Vector3();
          reticleRef.current.getWorldPosition(pos);
          handlePlaceItemInScene({ x: pos.x, y: pos.y, z: pos.z });
          toast.success('Product placed in your room!');
        }
      });

      session.addEventListener('end', () => {
        xrSessionRef.current = null;
        hitTestSourceRef.current = null;
      });

      toast.success('WebXR Immersive AR Session Active');
    } catch (err: any) {
      console.warn('Native WebXR session launch error, fallback to camera AR:', err);
      toast.error('Could not start immersive WebXR: ' + (err.message || 'Device restriction'));
    }
  };

  // Place Item in Multi-Product Scene
  const handlePlaceItemInScene = (overridePos?: { x: number; y: number; z: number }) => {
    const finalPos = overridePos || { ...transform.position, y: transform.position.y + elevationMeters };
    const newItem: PlacedARItem = {
      id: `ar-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productName: product.name,
      category: product.category?.name,
      price: Number(product.discountPrice || product.price),
      imageUrl: product.images?.[0] || '',
      geometryType: arConfig?.geometryType || 'table',
      primaryColor: arConfig?.primaryColor || '#0B2E5B',
      dimensions,
      position: finalPos,
      rotation: { ...transform.rotation },
      scale: { ...transform.scale }
    };

    setPlacedSceneItems(prev => [...prev, newItem]);
    setActiveItemId(newItem.id);
    placeModel(finalPos);
    toast.success(`Placed ${product.name} in your AR room!`);
  };

  // Add Item or Bundle to Cart Directly from AR
  const handleAddToCart = async () => {
    setIsAddingCart(true);
    try {
      await addItem(product.id, 1);
      await markCartAdded();
      toast.success(`${product.name} added to cart from AR!`);
    } catch {
      toast.error('Failed to add product to cart');
    } finally {
      setIsAddingCart(false);
    }
  };

  // Add All Placed AR Scene Items to Cart (Multi-Product Checkout)
  const handleAddAllSceneToCart = async () => {
    if (placedSceneItems.length === 0) {
      handleAddToCart();
      return;
    }

    setIsAddingCart(true);
    let count = 0;
    try {
      for (const item of placedSceneItems) {
        await addItem(item.productId, 1);
        count++;
      }
      toast.success(`Added all ${count} AR scene products to your cart!`);
    } catch {
      toast.error('Unable to add all items to cart');
    } finally {
      setIsAddingCart(false);
    }
  };

  // Capture Snapshot of AR Scene
  const handleTakeSnapshot = () => {
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = canvasRef.current;
    if (!canvas) return;

    captureSnapshot();

    try {
      const link = document.createElement('a');
      link.download = `InteriorG-AR-${product.slug || 'product'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('AR Room Snapshot saved to your photos!');
    } catch {
      toast.error('Failed to capture snapshot');
    }
  };

  // Share AR Scene (Social Media / Web Share API)
  const handleShareAR = async () => {
    const shareUrl = `${window.location.origin}/room-studio?mode=ar&product=${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `InteriorG — View ${product.name} in AR`,
          text: `Check out how this ${product.name} looks true-to-scale in AR!`,
          url: shareUrl
        });
        toast.success('AR scene shared successfully!');
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('AR share link copied to clipboard!');
    }
  };

  const isFullView = isFullscreen || !isEmbedded;

  return (
    <div 
      ref={containerRef}
      className={`ar-viewer-container ${isFullView ? 'ar-viewer-fullscreen' : 'ar-viewer-embedded'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: isFullView ? 'fixed' : 'relative',
        inset: isFullView ? 0 : 'auto',
        width: '100%',
        height: isFullView ? '100%' : '100%',
        minHeight: isFullView ? '100vh' : 620,
        zIndex: isFullView ? 9999 : 1,
        backgroundColor: '#000000',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
        borderRadius: isFullView ? 0 : '8px'
      }}
    >
      {/* Real Device Video Camera Background Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
      />

      {/* Three.js 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'auto'
        }}
      />

      {/* Snapshot White Flash Effect */}
      {isFlashActive && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ffffff',
            opacity: 0.85,
            zIndex: 10,
            transition: 'opacity 0.2s ease-out'
          }} 
        />
      )}

      {/* TOP HUD BAR */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          padding: '14px 18px',
          background: 'linear-gradient(180deg, rgba(11,46,91,0.92) 0%, rgba(11,46,91,0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          fontFamily: "'Montserrat', sans-serif"
        }}
      >
        {/* Left: Close & Mode Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => {
              if (isEmbedded && isFullscreen) {
                setIsFullscreen(false);
              } else {
                endSession();
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
            aria-label="Exit AR"
            title="Exit / Back to Studio"
          >
            <X size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.02em' }}>
                Vision AR Studio
              </span>
              <span 
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: '#2D8CFF',
                  padding: '2px 8px',
                  borderRadius: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {capabilities?.webxrSupported ? 'Vision AR • XR' : 'Vision AR'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#8EC5FF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Session: {formatTimer(elapsedSeconds)} • True 1:1 Scale
              {placedSceneItems.length > 0 && ` • ${placedSceneItems.length} in Scene`}
            </div>
          </div>
        </div>

        {/* Right: Actions (Share, Analytics, Fullscreen, Mobile QR) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleShareAR}
            title="Share AR Scene"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Share2 size={16} />
          </button>

          <button
            onClick={() => setShowAnalyticsModal(true)}
            title="AR Session Analytics & Telemetry"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <BarChart3 size={16} />
          </button>

          {isEmbedded && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          {capabilities?.webxrSupported && (
            <button
              onClick={handleLaunchImmersiveXR}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#2D8CFF',
                color: '#ffffff',
                border: 'none',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} />
              Immersive XR
            </button>
          )}

          <button
            onClick={() => setShowQrModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Smartphone size={13} />
            Mobile Vision AR
          </button>
        </div>
      </div>

      {/* CENTER SURFACE TARGETING RETICLE HINT */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 4,
          pointerEvents: 'none',
          textAlign: 'center'
        }}
      >
        {!isPlaced && (
          <div 
            style={{
              backgroundColor: 'rgba(11,46,91,0.85)',
              border: '1px solid #2D8CFF',
              borderRadius: 24,
              padding: '8px 18px',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Move size={14} color="#8EC5FF" />
            Vision AR: Tap floor to place • Drag to move & rotate
          </div>
        )}
      </div>

      {/* FLOATING ACTION PILLS (Snapshot, Place Another, 1:1 Scale, Catalog) */}
      <div
        style={{
          position: 'absolute',
          right: 16,
          top: 80,
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <button
          onClick={handleTakeSnapshot}
          title="Take AR Photo"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(11,46,91,0.85)',
            border: '2px solid #8EC5FF',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Camera size={20} color="#8EC5FF" />
        </button>

        <button
          onClick={() => handlePlaceItemInScene()}
          title="Place Item in Scene"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#2D8CFF',
            border: '2px solid #ffffff',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(45,140,255,0.4)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Plus size={22} color="#ffffff" />
        </button>

        <button
          onClick={() => {
            resetToTrueScale();
            toast.success('Reset to 1:1 true physical dimensions');
          }}
          title="Reset to 1:1 True Scale"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(11,46,91,0.85)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 800,
            backdropFilter: 'blur(8px)'
          }}
        >
          1:1
        </button>

        {catalog.length > 0 && (
          <button
            onClick={() => setShowCatalogDrawer(prev => !prev)}
            title="Browse Catalog & Add Pieces"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(11,46,91,0.85)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Layers size={18} color="#8EC5FF" />
          </button>
        )}
      </div>

      {/* MULTI-PRODUCT PLACED SCENE STRIP */}
      {placedSceneItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 80,
            zIndex: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: '40vh',
            overflowY: 'auto'
          }}
        >
          {placedSceneItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveItemId(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 20,
                backgroundColor: activeItemId === item.id ? 'rgba(45,140,255,0.9)' : 'rgba(11,46,91,0.85)',
                border: '1px solid #8EC5FF',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <span>#{idx + 1} {item.productName.substring(0, 16)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlacedSceneItems(prev => prev.filter(i => i.id !== item.id));
                  toast.success(`Removed ${item.productName} from scene`);
                }}
                style={{ background: 'none', border: 'none', color: '#ff8080', cursor: 'pointer', padding: 2 }}
                title="Remove from AR Scene"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM CONTROL DOCK */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 6,
          padding: '14px 18px',
          background: 'linear-gradient(0deg, rgba(11,46,91,0.98) 0%, rgba(11,46,91,0.88) 75%, rgba(11,46,91,0) 100%)',
          borderTop: '1px solid rgba(142,197,255,0.2)',
          backdropFilter: 'blur(16px)',
          color: '#ffffff',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          {/* Product Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div 
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #8EC5FF'
                }}
              >
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Sparkles size={22} color="#0B2E5B" />
                )}
              </div>

              <div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                  {product.name}
                </div>
                <div style={{ fontSize: 11, color: '#8EC5FF', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span>₹{Number(product.discountPrice || product.price).toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span>{product.category?.name || 'Interior Piece'}</span>
                  <span>•</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>
                    {dimensions.widthFeet}ft × {dimensions.depthFeet}ft × {dimensions.heightFeet}ft ({dimensions.widthMeters}m × {dimensions.heightMeters}m)
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Add To Cart & Bundle Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {placedSceneItems.length > 1 ? (
                <button
                  onClick={handleAddAllSceneToCart}
                  disabled={isAddingCart}
                  style={{
                    backgroundColor: '#2D8CFF',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 20,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 16px rgba(45,140,255,0.4)',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  <ShoppingBag size={15} />
                  {isAddingCart ? 'Adding...' : `Buy Scene (${placedSceneItems.length})`}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingCart}
                  style={{
                    backgroundColor: '#2D8CFF',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 20,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 16px rgba(45,140,255,0.4)',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  <ShoppingBag size={15} />
                  {isAddingCart ? 'Adding...' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>

          {/* Interaction Modes Selector: Move & Place / Rotate 360° / Scale Size / 1:1 True Scale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setInteractionMode('MOVE')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                backgroundColor: interactionMode === 'MOVE' ? '#2D8CFF' : 'rgba(255,255,255,0.12)',
                border: interactionMode === 'MOVE' ? '1px solid #8EC5FF' : '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Move size={13} />
              <span>Move & Place</span>
            </button>

            <button
              type="button"
              onClick={() => setInteractionMode('ROTATE')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                backgroundColor: interactionMode === 'ROTATE' ? '#2D8CFF' : 'rgba(255,255,255,0.12)',
                border: interactionMode === 'ROTATE' ? '1px solid #8EC5FF' : '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCw size={13} />
              <span>Rotate 360°</span>
            </button>

            <button
              type="button"
              onClick={() => setInteractionMode('SCALE')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                backgroundColor: interactionMode === 'SCALE' ? '#2D8CFF' : 'rgba(255,255,255,0.12)',
                border: interactionMode === 'SCALE' ? '1px solid #8EC5FF' : '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Sliders size={13} />
              <span>Scale Size</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetToTrueScale();
                toast.success('Snapped to 1:1 True Physical Scale');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 14px',
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.14)',
                border: '1px solid #8EC5FF',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Reset to 1:1 True Real-World Scale"
            >
              1:1 True Scale
            </button>
          </div>

          {/* Interactive Transform Adjustment Sliders */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '8px 12px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 12,
              fontSize: 11
            }}
          >
            {/* Rotate Left/Right Quick Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#8EC5FF', fontWeight: 600 }}>Rotate:</span>
              <button
                onClick={() => rotateModel(-45)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: 6,
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => rotateModel(45)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: 6,
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCw size={13} />
              </button>
            </div>

            {/* Scale Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <span style={{ color: '#8EC5FF', fontWeight: 600 }}>Scale:</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={transform.scale.x}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  scaleModel(val / transform.scale.x);
                }}
                style={{ flex: 1, accentColor: '#2D8CFF', cursor: 'pointer' }}
              />
              <span style={{ minWidth: 40, textAlign: 'right', fontWeight: 600 }}>
                {Math.round(transform.scale.x * 100)}%
              </span>
            </div>

            {/* Height / Elevation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#8EC5FF', fontWeight: 600 }}>Elevation:</span>
              <input
                type="range"
                min="-0.5"
                max="1.5"
                step="0.05"
                value={elevationMeters}
                onChange={e => setElevationMeters(parseFloat(e.target.value))}
                style={{ width: 80, accentColor: '#2D8CFF', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CATALOG SWITCHER DRAWER (switch/place products in AR) */}
      {showCatalogDrawer && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            right: 70,
            width: 320,
            maxHeight: '70vh',
            backgroundColor: 'rgba(11,46,91,0.96)',
            border: '1px solid #8EC5FF',
            borderRadius: 16,
            backdropFilter: 'blur(20px)',
            zIndex: 8,
            overflowY: 'auto',
            padding: 16,
            color: '#ffffff',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Catalog Pieces for AR</span>
            <button
              onClick={() => setShowCatalogDrawer(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {catalog.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(item);
                  setShowCatalogDrawer(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: item.id === product.id ? 'rgba(45,140,255,0.3)' : 'rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  border: item.id === product.id ? '1px solid #2D8CFF' : 'none'
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#0B2E5B' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#8EC5FF' }}>
                    ₹{Number(item.discountPrice || item.price).toLocaleString('en-IN')}
                  </div>
                </div>
                {item.id === product.id && <Check size={16} color="#2D8CFF" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AR SESSION ANALYTICS MODAL (Analytics Roadmap Feature) */}
      {showAnalyticsModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowAnalyticsModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0B2E5B',
              borderRadius: 20,
              padding: '24px 22px',
              maxWidth: 420,
              width: '100%',
              color: '#ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              border: '2px solid #8EC5FF'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={20} color="#8EC5FF" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
                  Vision AR Session Telemetry & Analytics
                </h3>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#DCE7F5', margin: '0 0 16px' }}>
              Real-time Vision AR interaction telemetry synchronized with MongoDB database.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10, color: '#8EC5FF', textTransform: 'uppercase' }}>Session Duration</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{formatTimer(elapsedSeconds)}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10, color: '#8EC5FF', textTransform: 'uppercase' }}>Placements</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{interactions.placementsCount}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10, color: '#8EC5FF', textTransform: 'uppercase' }}>Rotations</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{interactions.rotationsCount}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10, color: '#8EC5FF', textTransform: 'uppercase' }}>Snapshots</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{interactions.snapshotsCount}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#8EC5FF', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 10 }}>
              Session ID: <code style={{ color: '#ffffff' }}>{activeSession?.sessionId || 'active-local-ar'}</code>
            </div>
          </div>
        </div>
      )}

      {/* CROSS-DEVICE QR CODE MODAL (SCAN WITH PHONE TO VIEW IN AR) */}
      {showQrModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              backgroundColor: '#F5F9FF',
              borderRadius: 20,
              padding: '28px 24px',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              color: '#1F2937',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              border: '2px solid #8EC5FF'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1F2937' }}
              >
                <X size={20} />
              </button>
            </div>

            <div 
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: '#0B2E5B',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Smartphone size={26} color="#8EC5FF" />
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px', fontFamily: "'Montserrat', sans-serif", color: '#0B2E5B' }}>
              Scan to View in Your Room
            </h3>
            <p style={{ fontSize: 12, color: '#4B5563', margin: '0 0 16px' }}>
              Point your smartphone camera at this QR code to place <strong>{product.name}</strong> true-to-scale in your living space.
            </p>

            {qrCodeDataUrl ? (
              <div 
                style={{
                  padding: 12,
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  display: 'inline-block',
                  border: '1px solid #DCE7F5',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                <img src={qrCodeDataUrl} alt="AR QR Code" style={{ width: 200, height: 200, display: 'block' }} />
              </div>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw className="animate-spin" size={24} color="#0B2E5B" />
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 11, color: '#6B7280' }}>
              Compatible with iOS (Safari Quick Look) & Android (Chrome WebXR / Scene Viewer)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
