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
  AlertCircle
} from 'lucide-react';
import { Product } from '../api/products';
import { ARProductConfig, ARDimensions } from '../types/ar';
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
  roomDimensions?: { width: number; height: number; length: number };
}

export function ARViewer({
  product,
  catalog = [],
  onSelectProduct,
  onClose,
  roomDimensions
}: ARViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { addItem } = useCart();
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'transform' | 'info' | 'dimensions'>('transform');

  // Height offset in meters
  const [elevationMeters, setElevationMeters] = useState<number>(0);
  const [isFlashActive, setIsFlashActive] = useState(false);

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
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const xrSessionRef = useRef<any>(null);
  const hitTestSourceRef = useRef<any>(null);

  // Drag interaction tracking
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.01,
      25
    );
    camera.position.set(0, 1.2, 0);
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

    // 6. Build 3D Furniture Model
    const modelGroup = new THREE.Group();
    const furnitureMesh = buildRealisticProceduralModel(
      arConfig?.geometryType || 'table',
      arConfig?.primaryColor || '#0B2E5B',
      dimensions
    );
    modelGroup.add(furnitureMesh);
    modelGroup.position.set(transform.position.x, transform.position.y, transform.position.z);
    modelGroup.rotation.y = transform.rotation.y;
    modelGroup.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 7. Virtual Shadow Receiver Ground Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(8, 8).rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 8. Start Camera Stream if not running full WebXR hardware session
    let cameraVideo: HTMLVideoElement | null = null;
    startCameraVideo().then(v => {
      cameraVideo = v;
      if (videoRef.current && v) {
        videoRef.current.srcObject = v.srcObject;
      }
    });

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation / Render Loop
    let lastTime = performance.now();
    const renderLoop = (time: number, frame?: any) => {
      // If native WebXR session is active with hit-test
      if (frame && hitTestSourceRef.current && xrSessionRef.current) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
        if (hitTestResults.length > 0 && reticle) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        } else if (reticle) {
          reticle.visible = false;
        }
      } else if (reticle) {
        // Fallback simulation: reticle hovers smoothly at floor level
        reticle.visible = true;
        reticle.position.set(0, 0, -1.6);
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

  // Sync Transform updates to Three.js Model Group
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

  // Handle Touch/Mouse Drag on Canvas for 360 Rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousPointerPosRef.current.x;
    previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
    rotateModel(deltaX * 0.8);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
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
          placeModel({ x: pos.x, y: pos.y, z: pos.z });
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

  // Add Item to Cart Directly from AR
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

  // Capture Snapshot of AR Scene
  const handleTakeSnapshot = () => {
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = canvasRef.current;
    if (!canvas) return;

    captureSnapshot();

    // Export merged image
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

  return (
    <div 
      ref={containerRef}
      className="ar-viewer-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000000',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none'
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
          padding: '16px 20px',
          background: 'linear-gradient(180deg, rgba(11,46,91,0.85) 0%, rgba(11,46,91,0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          fontFamily: "'Montserrat', sans-serif"
        }}
      >
        {/* Left: Close & Mode Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => {
              endSession();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
            aria-label="Exit AR"
          >
            <X size={20} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.02em' }}>
                WebXR AR Product Studio
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
                {capabilities?.webxrSupported ? 'WebXR' : 'Camera AR'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#8EC5FF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Session: {formatTimer(elapsedSeconds)} • True-Scale 1:1 Rendering
            </div>
          </div>
        </div>

        {/* Right: Cross-Device QR Code & Native WebXR Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} />
              Immersive AR
            </button>
          )}

          <button
            onClick={() => setShowQrModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              borderRadius: 20,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Smartphone size={14} />
            Mobile AR
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
            Drag to rotate • Point camera at floor or table
          </div>
        )}
      </div>

      {/* FLOATING ACTION PILLS (True Scale, Snapshot, Place) */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 90,
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <button
          onClick={handleTakeSnapshot}
          title="Take AR Photo"
          style={{
            width: 48,
            height: 48,
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
          <Camera size={22} color="#8EC5FF" />
        </button>

        <button
          onClick={() => {
            placeModel();
            toast.success('Position locked to current camera view!');
          }}
          title="Lock / Place in Room"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: isPlaced ? '#22c55e' : 'rgba(11,46,91,0.85)',
            border: '2px solid #ffffff',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Check size={22} color="#ffffff" />
        </button>

        <button
          onClick={() => {
            resetToTrueScale();
            toast.success('Reset to 1:1 true-to-scale physical dimensions');
          }}
          title="Reset to 1:1 True Scale"
          style={{
            width: 48,
            height: 48,
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
            title="Browse Catalog"
            style={{
              width: 48,
              height: 48,
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
            <Layers size={20} color="#8EC5FF" />
          </button>
        )}
      </div>

      {/* BOTTOM CONTROL DOCK */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 6,
          padding: '16px 20px',
          background: 'linear-gradient(0deg, rgba(11,46,91,0.96) 0%, rgba(11,46,91,0.85) 75%, rgba(11,46,91,0) 100%)',
          borderTop: '1px solid rgba(142,197,255,0.2)',
          backdropFilter: 'blur(16px)',
          color: '#ffffff',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          {/* Product Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div 
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
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
                  <Sparkles size={24} color="#0B2E5B" />
                )}
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
                  {product.name}
                </div>
                <div style={{ fontSize: 12, color: '#8EC5FF', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span>₹{Number(product.discountPrice || product.price).toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span>{product.category?.name || 'Interior Piece'}</span>
                  <span>•</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>
                    {dimensions.widthFeet}ft × {dimensions.depthFeet}ft × {dimensions.heightFeet}ft
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Add To Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingCart}
              style={{
                backgroundColor: '#2D8CFF',
                color: '#ffffff',
                border: 'none',
                borderRadius: 24,
                padding: '12px 22px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(45,140,255,0.4)',
                transition: 'background-color 0.2s',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              <ShoppingBag size={16} />
              {isAddingCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {/* Interactive Transform Adjustment Sliders */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '10px 14px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 14,
              fontSize: 12
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
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => rotateModel(45)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: 6,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCw size={14} />
              </button>
            </div>

            {/* Scale Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
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
              <span style={{ minWidth: 44, textAlign: 'right', fontWeight: 600 }}>
                {Math.round(transform.scale.x * 100)}%
              </span>
            </div>

            {/* Height / Elevation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#8EC5FF', fontWeight: 600 }}>Elevation:</span>
              <input
                type="range"
                min="-0.5"
                max="1.5"
                step="0.05"
                value={elevationMeters}
                onChange={e => setElevationMeters(parseFloat(e.target.value))}
                style={{ width: 90, accentColor: '#2D8CFF', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CATALOG SWITCHER DRAWER (allows switching products in AR) */}
      {showCatalogDrawer && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            right: 80,
            width: 320,
            maxHeight: '70vh',
            backgroundColor: 'rgba(11,46,91,0.95)',
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
            <span style={{ fontWeight: 700, fontSize: 14 }}>Switch Product in AR</span>
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
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#0B2E5B',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Smartphone size={28} color="#8EC5FF" />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', fontFamily: "'Montserrat', sans-serif", color: '#0B2E5B' }}>
              Scan to View in Your Room
            </h3>
            <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 20px' }}>
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
                <img src={qrCodeDataUrl} alt="AR QR Code" style={{ width: 220, height: 220, display: 'block' }} />
              </div>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw className="animate-spin" size={24} color="#0B2E5B" />
              </div>
            )}

            <div style={{ marginTop: 20, fontSize: 11, color: '#6B7280' }}>
              Compatible with iOS (Safari Quick Look) & Android (Chrome WebXR / Scene Viewer)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
