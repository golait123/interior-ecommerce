import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  Compass, 
  Play, 
  Pause,
  Plus,
  Trash2,
  Sliders,
  Move,
  ShoppingBag,
  Check,
  X,
  Search
} from 'lucide-react';
import { Hotspot } from '../api/visualizer';
import { Product } from '../api/products';
import toast from 'react-hot-toast';

export interface PlacedItem {
  id: string;
  productId: string;
  name: string;
  category?: string;
  price: number;
  imageUrl: string;
  yaw: number; // degrees (-180 to 180)
  pitch: number; // degrees (-85 to 85)
  scale: number; // 0.6 to 2.5
}

interface Panorama360ViewerProps {
  imageUrl: string;
  hotspots?: Hotspot[];
  activeHotspot?: Hotspot | null;
  onSelectHotspot?: (hotspot: Hotspot | null) => void;
  onAddToCart?: (productId: string) => void;
  showStaged?: boolean;
  availableProducts?: Product[];
  placedItems?: PlacedItem[];
  onPlacedItemsChange?: (items: PlacedItem[]) => void;
}

export function Panorama360Viewer({
  imageUrl,
  hotspots = [],
  activeHotspot = null,
  onSelectHotspot,
  onAddToCart,
  showStaged = true,
  availableProducts = [],
  placedItems: externalPlacedItems,
  onPlacedItemsChange,
}: Panorama360ViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const placedGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Interaction angles (degrees)
  const lonRef = useRef<number>(0);
  const latRef = useRef<number>(0);
  const targetLonRef = useRef<number>(0);
  const targetLatRef = useRef<number>(0);
  const isUserInteractingRef = useRef<boolean>(false);
  const onPointerDownPointerXRef = useRef<number>(0);
  const onPointerDownPointerYRef = useRef<number>(0);
  const onPointerDownLonRef = useRef<number>(0);
  const onPointerDownLatRef = useRef<number>(0);

  // States
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [fov, setFov] = useState<number>(75);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Item Placement States
  const [isPlacingItem, setIsPlacingItem] = useState<Product | null>(null);
  const [isPlacementTrayOpen, setIsPlacementTrayOpen] = useState<boolean>(false);
  const [activePlacedItemId, setActivePlacedItemId] = useState<string | null>(null);
  const [trayCategory, setTrayCategory] = useState<string>('ALL');
  const [traySearch, setTraySearch] = useState<string>('');

  // Internal placed items list (if not managed externally)
  const [internalPlacedItems, setInternalPlacedItems] = useState<PlacedItem[]>([]);
  const placedItems = externalPlacedItems ?? internalPlacedItems;
  const setPlacedItems = onPlacedItemsChange ?? setInternalPlacedItems;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1500);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High-DPI Sharpness
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.querySelectorAll('canvas').forEach(c => c.remove());
    container.appendChild(renderer.domElement);

    // 4. Inverted High-Resolution Sphere
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.FrontSide,
    });
    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // 5. Group for 3D Placed Items
    const placedGroup = new THREE.Group();
    scene.add(placedGroup);
    placedGroupRef.current = placedGroup;

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Update FOV
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [fov]);

  // Load Panorama Texture
  useEffect(() => {
    if (!sphereMeshRef.current) return;
    setImageLoaded(false);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    loader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        if (sphereMeshRef.current) {
          const mat = sphereMeshRef.current.material as THREE.MeshBasicMaterial;
          if (mat.map) mat.map.dispose();
          mat.map = texture;
          mat.needsUpdate = true;
          setImageLoaded(true);
        }
      },
      undefined,
      () => {
        // Fallback smooth gradient if image load is blocked
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 2048;
        fallbackCanvas.height = 1024;
        const fCtx = fallbackCanvas.getContext('2d');
        if (fCtx) {
          fCtx.fillStyle = '#2d2a27';
          fCtx.fillRect(0, 0, 2048, 1024);
          const fallbackTexture = new THREE.CanvasTexture(fallbackCanvas);
          if (sphereMeshRef.current) {
            const mat = sphereMeshRef.current.material as THREE.MeshBasicMaterial;
            mat.map = fallbackTexture;
            mat.needsUpdate = true;
            setImageLoaded(true);
          }
        }
      }
    );
  }, [imageUrl]);

  // Re-render 3D Placed Items when placedItems change
  useEffect(() => {
    const placedGroup = placedGroupRef.current;
    if (!placedGroup) return;

    // Clear previous item sprites
    while (placedGroup.children.length > 0) {
      const child = placedGroup.children[0] as THREE.Sprite;
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
      placedGroup.remove(child);
    }

    // Build 3D Sprites for each placed item
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    placedItems.forEach((item) => {
      loader.load(item.imageUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.96,
          depthTest: true,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Calculate 3D sphere coordinate from yaw & pitch
        const radius = 450; // inside the sphere
        const phi = THREE.MathUtils.degToRad(90 - item.pitch);
        const theta = THREE.MathUtils.degToRad(item.yaw);

        sprite.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );

        // Scale sprite realistically
        const baseSize = item.category?.toLowerCase().includes('wallpaper') ? 220 : 130;
        sprite.scale.set(baseSize * item.scale, baseSize * item.scale, 1);
        sprite.userData = { id: item.id, item };

        placedGroup.add(sprite);
      });
    });
  }, [placedItems]);

  // Main Render Loop
  useEffect(() => {
    const renderLoop = () => {
      animationFrameRef.current = requestAnimationFrame(renderLoop);

      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const container = containerRef.current;

      if (!camera || !renderer || !scene || !container) return;

      if (autoRotate && !isUserInteractingRef.current) {
        targetLonRef.current += 0.08;
      }

      latRef.current = Math.max(-85, Math.min(85, latRef.current));
      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      lonRef.current += (targetLonRef.current - lonRef.current) * 0.1;
      latRef.current += (targetLatRef.current - latRef.current) * 0.1;

      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(target);

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [autoRotate]);

  // Handle Canvas Pointer Down (Rotation or Item Placement)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPlacingItem) {
      // Raycast on sphere to place item at exact clicked point!
      handleRaycastPlaceItem(e);
      return;
    }

    isUserInteractingRef.current = true;
    onPointerDownPointerXRef.current = e.clientX;
    onPointerDownPointerYRef.current = e.clientY;
    onPointerDownLonRef.current = targetLonRef.current;
    onPointerDownLatRef.current = targetLatRef.current;
  };

  // Raycast to place item on wall / floor / surface
  const handleRaycastPlaceItem = (e: React.PointerEvent) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const sphereMesh = sphereMeshRef.current;
    if (!container || !camera || !sphereMesh || !isPlacingItem) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(sphereMesh);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const radius = point.length();

      // Convert point to spherical coordinates
      const pitch = Math.round(90 - THREE.MathUtils.radToDeg(Math.acos(point.y / radius)));
      const yaw = Math.round(THREE.MathUtils.radToDeg(Math.atan2(point.z, point.x)));

      const newItem: PlacedItem = {
        id: `placed-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        productId: isPlacingItem.id,
        name: isPlacingItem.name,
        category: isPlacingItem.category?.name,
        price: Number(isPlacingItem.discountPrice || isPlacingItem.price),
        imageUrl: isPlacingItem.images?.[0] || '',
        yaw,
        pitch,
        scale: 1.0,
      };

      const nextItems = [...placedItems, newItem];
      setPlacedItems(nextItems);
      setActivePlacedItemId(newItem.id);
      setIsPlacingItem(null);
      toast.success(`Placed "${newItem.name}" in the room!`);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isUserInteractingRef.current) return;
    const deltaX = e.clientX - onPointerDownPointerXRef.current;
    const deltaY = e.clientY - onPointerDownPointerYRef.current;

    targetLonRef.current = onPointerDownLonRef.current - deltaX * 0.18;
    targetLatRef.current = onPointerDownLatRef.current + deltaY * 0.18;
  };

  const handlePointerUp = () => {
    isUserInteractingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setFov((prev) => Math.max(35, Math.min(95, prev + e.deltaY * 0.05)));
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Active Placed Item details
  const activePlacedItem = placedItems.find(i => i.id === activePlacedItemId);

  const handleScalePlacedItem = (scale: number) => {
    if (!activePlacedItemId) return;
    const updated = placedItems.map(item => 
      item.id === activePlacedItemId ? { ...item, scale } : item
    );
    setPlacedItems(updated);
  };

  const handleRemovePlacedItem = (id: string) => {
    const updated = placedItems.filter(item => item.id !== id);
    setPlacedItems(updated);
    if (activePlacedItemId === id) setActivePlacedItemId(null);
    toast.success('Item removed from room');
  };

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className={`relative bg-dark overflow-hidden select-none border ${
        isPlacingItem ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      } ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full'}`}
      style={{ 
        height: isFullscreen ? '100vh' : '560px',
        borderRadius: isFullscreen ? '0' : '6px'
      }}
    >
      {/* Loading Overlay */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-dark flex flex-col items-center justify-center text-white z-20">
          <RotateCw size={32} className="animate-spin text-accent mb-3" />
          <p className="text-sm font-medium tracking-wide">Synthesizing 360° Spherical Room View...</p>
          <span className="text-xs text-muted">Converting panorama to high-definition perspective</span>
        </div>
      )}

      {/* Placement Mode Top Banner */}
      {isPlacingItem && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-5 py-2.5 rounded-full shadow-2xl z-40 flex items-center gap-3 border border-white/20 animate-bounce">
          <Sparkles size={16} />
          <span className="text-xs font-semibold">Click anywhere on the wall, floor, or table to place: <strong>{isPlacingItem.name}</strong></span>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsPlacingItem(null); }}
            className="p-1 text-white hover:bg-white/20 rounded-full border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-30">
        <div className="bg-dark/85 backdrop-blur-md px-3.5 py-1.5 border border-white/20 text-xs font-semibold flex items-center gap-2 text-white shadow-lg pointer-events-auto" style={{ borderRadius: '20px' }}>
          <Compass size={14} className="text-accent" />
          <span>360° Spherical View — {placedItems.length} item(s) placed in room</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Add Item to Room Trigger Button */}
          <button
            onClick={() => setIsPlacementTrayOpen(!isPlacementTrayOpen)}
            className="px-3 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-semibold border-none flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
            style={{ borderRadius: '20px' }}
          >
            <Plus size={14} />
            <span>Place Item In Room</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 border text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              autoRotate ? 'bg-accent text-white border-accent' : 'bg-dark/85 text-white/80 border-white/20'
            }`}
            style={{ borderRadius: '20px' }}
            title={autoRotate ? 'Pause 360 rotation' : 'Start auto-rotation'}
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Zoom Controls */}
          <div className="bg-dark/85 backdrop-blur border border-white/20 flex items-center p-0.5 shadow-md" style={{ borderRadius: '20px' }}>
            <button
              onClick={() => setFov(f => Math.max(35, f - 8))}
              className="p-1.5 text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <span className="text-[10px] text-white/60 px-1 font-mono">{Math.round(fov)}°</span>
            <button
              onClick={() => setFov(f => Math.min(95, f + 8))}
              className="p-1.5 text-white/80 hover:text-white border-none bg-transparent cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-dark/85 backdrop-blur border border-white/20 text-white/80 hover:text-white shadow-md cursor-pointer"
            style={{ borderRadius: '20px' }}
            title="Toggle Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Floating Tray to Select Product for Placement in Room */}
      {isPlacementTrayOpen && (() => {
        const filteredTrayProducts = availableProducts.filter((prod) => {
          const cat = (prod.category?.name || '').toLowerCase();
          const name = prod.name.toLowerCase();
          if (trayCategory === 'WALL' && !(cat.includes('wall') || cat.includes('mirror') || name.includes('mirror') || name.includes('art'))) return false;
          if (trayCategory === 'LIGHTING' && !(cat.includes('light') || name.includes('lamp') || name.includes('chandelier') || name.includes('pendant'))) return false;
          if (trayCategory === 'FURNITURE' && !(cat.includes('furniture') || name.includes('table') || name.includes('console') || name.includes('chair'))) return false;
          if (trayCategory === 'DECOR' && !(cat.includes('decor') || cat.includes('vase') || name.includes('vase') || name.includes('accent'))) return false;
          if (traySearch.trim()) {
            const q = traySearch.toLowerCase();
            return name.includes(q) || cat.includes(q);
          }
          return true;
        });

        return (
          <div 
            className="absolute top-16 right-4 w-88 bg-white/95 backdrop-blur-md border border-dark/15 p-4 shadow-2xl z-40 rounded max-h-[440px] flex flex-col pointer-events-auto animate-fade-in"
          >
            <div className="flex justify-between items-center mb-2 pb-2 border-b">
              <div>
                <h4 className="text-sm font-bold m-0 text-dark">Place Item in Room</h4>
                <p className="text-[11px] text-muted m-0">Select an item, then click any wall or floor in 360°</p>
              </div>
              <button 
                onClick={() => setIsPlacementTrayOpen(false)}
                className="p-1 text-muted hover:text-dark border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search items to place..."
                value={traySearch}
                onChange={(e) => setTraySearch(e.target.value)}
                className="w-full text-xs pl-7 pr-6 py-1 border rounded bg-white focus:outline-none focus:border-dark"
              />
              {traySearch && (
                <button
                  type="button"
                  onClick={() => setTraySearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-dark border-none bg-transparent cursor-pointer p-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 border-b no-scrollbar">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'WALL', label: '🪞 Walls' },
                { id: 'LIGHTING', label: '💡 Lights' },
                { id: 'FURNITURE', label: '🛋️ Furniture' },
                { id: 'DECOR', label: '🏺 Decor' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setTrayCategory(pill.id)}
                  className={`text-[10px] py-0.5 px-2 rounded-full whitespace-nowrap border cursor-pointer font-medium ${
                    trayCategory === pill.id
                      ? 'bg-dark text-white border-dark'
                      : 'bg-white text-dark border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Items List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredTrayProducts.length === 0 ? (
                <div className="text-center py-6 text-muted text-xs">
                  No matching items found.
                </div>
              ) : (
                filteredTrayProducts.slice(0, 25).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setIsPlacingItem(prod);
                      setIsPlacementTrayOpen(false);
                      toast('Click anywhere inside the room to place this item!', { icon: '📍' });
                    }}
                    className="p-2 border hover:border-accent hover:bg-[#faf6f0] flex items-center gap-3 cursor-pointer rounded transition-all bg-white"
                  >
                    <div className="w-11 h-11 bg-gray-100 flex-shrink-0 border overflow-hidden rounded">
                      <img src={prod.images?.[0]} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold truncate m-0 text-dark">{prod.name}</h5>
                      <span className="text-[11px] text-accent font-bold">
                        ₹{Number(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button className="btn btn-primary btn-sm py-1 px-2 text-[10px] cursor-pointer">
                      Place
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* Active Placed Item Controls Popover */}
      {activePlacedItem && (
        <div 
          className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-white/95 backdrop-blur-md border border-dark/10 p-4 shadow-2xl z-40 rounded pointer-events-auto"
        >
          <div className="flex gap-3 items-center mb-3">
            <div className="w-14 h-14 bg-gray-100 flex-shrink-0 border overflow-hidden rounded">
              <img src={activePlacedItem.imageUrl} alt={activePlacedItem.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="badge badge-gray text-[10px]">Placed in Room</span>
              <h4 className="text-xs font-bold truncate m-0 text-dark">{activePlacedItem.name}</h4>
              <span className="text-sm font-bold text-accent">₹{activePlacedItem.price}</span>
            </div>
            <button 
              onClick={() => setActivePlacedItemId(null)}
              className="text-muted hover:text-dark p-1 border-none bg-transparent cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scale Control Slider */}
          <div className="bg-secondary p-2 rounded mb-3">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span>Adjust Scale in Room</span>
              <span>{Math.round(activePlacedItem.scale * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="2.2"
              step="0.1"
              value={activePlacedItem.scale}
              onChange={(e) => handleScalePlacedItem(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-accent"
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => onAddToCart?.(activePlacedItem.productId)}
              className="btn btn-primary btn-sm flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={14} />
              <span>Add to Cart</span>
            </button>
            <button 
              onClick={() => handleRemovePlacedItem(activePlacedItem.id)}
              className="btn btn-secondary btn-sm py-1.5 px-3 text-danger hover:bg-danger hover:text-white text-xs flex items-center gap-1"
              title="Remove from room"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Subtle Bottom Staging Bar */}
      <div className="absolute bottom-4 right-4 pointer-events-none z-30 hidden sm:flex items-center gap-2">
        <div className="bg-dark/85 backdrop-blur px-3 py-1 text-[11px] text-white/80 border border-white/20 rounded">
          Equirectangular 360° Spherical Projection • WebGL 2.0 HD
        </div>
      </div>
    </div>
  );
}
