import * as THREE from 'three';
import { ARCapabilities, ARDimensions, ARProductConfig } from '../types/ar';

export async function detectARCapabilities(): Promise<ARCapabilities> {
  const isWebXR = typeof navigator !== 'undefined' && 'xr' in navigator;
  let webxrSupported = false;
  let hitTestSupported = false;

  if (isWebXR && (navigator as any).xr?.isSessionSupported) {
    try {
      webxrSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
      hitTestSupported = webxrSupported;
    } catch {
      webxrSupported = false;
    }
  }

  const cameraAvailable = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(userAgent);

  const anchor = typeof document !== 'undefined' ? document.createElement('a') : null;
  const quickLookSupported = isIOS && !!anchor?.relList?.supports?.('ar');
  const sceneViewerSupported = isAndroid;

  let preferredMode: ARCapabilities['preferredMode'] = 'CAMERA_SIMULATION';
  if (webxrSupported) {
    preferredMode = 'WEBXR_IMMERSIVE';
  } else if (quickLookSupported) {
    preferredMode = 'QUICK_LOOK';
  } else if (sceneViewerSupported) {
    preferredMode = 'SCENE_VIEWER';
  } else {
    preferredMode = 'CAMERA_SIMULATION';
  }

  return {
    webxrSupported,
    hitTestSupported,
    cameraAvailable,
    quickLookSupported,
    sceneViewerSupported,
    preferredMode
  };
}

export async function startCameraVideo(): Promise<HTMLVideoElement | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });

    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.srcObject = stream;
    await video.play();
    return video;
  } catch (err) {
    console.warn('Unable to access device camera for AR background:', err);
    return null;
  }
}

export function stopCameraVideo(video: HTMLVideoElement | null) {
  if (!video || !video.srcObject) return;
  const stream = video.srcObject as MediaStream;
  stream.getTracks().forEach(track => track.stop());
  video.srcObject = null;
}

export function createReticle(): THREE.Mesh {
  const geometry = new THREE.RingGeometry(0.15, 0.18, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x2d8cff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  return reticle;
}

export function buildRealisticProceduralModel(
  geometryType: ARProductConfig['geometryType'],
  primaryColorHex = '#0B2E5B',
  dimensions: ARDimensions
): THREE.Group {
  const group = new THREE.Group();
  const primaryColor = new THREE.Color(primaryColorHex);
  const secondaryColor = new THREE.Color('#2D8CFF');
  const accentGold = new THREE.Color('#C5A880');
  const teakWood = new THREE.Color('#5A3D28');
  const foliageGreen = new THREE.Color('#2C5E3B');

  const mainMaterial = new THREE.MeshStandardMaterial({
    color: primaryColor,
    roughness: 0.45,
    metalness: 0.15
  });

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: teakWood,
    roughness: 0.7,
    metalness: 0.05
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: accentGold,
    roughness: 0.25,
    metalness: 0.8
  });

  switch (geometryType) {
    case 'sofa': {
      // Main Seat Base
      const seatGeo = new THREE.BoxGeometry(dimensions.widthMeters, 0.22, dimensions.depthMeters);
      const seatMesh = new THREE.Mesh(seatGeo, mainMaterial);
      seatMesh.position.y = 0.28;
      seatMesh.castShadow = true;
      seatMesh.receiveShadow = true;
      group.add(seatMesh);

      // Backrest
      const backGeo = new THREE.BoxGeometry(dimensions.widthMeters, dimensions.heightMeters * 0.65, 0.18);
      const backMesh = new THREE.Mesh(backGeo, mainMaterial);
      backMesh.position.set(0, 0.28 + dimensions.heightMeters * 0.32, -dimensions.depthMeters / 2 + 0.09);
      backMesh.castShadow = true;
      group.add(backMesh);

      // Armrests (Left & Right)
      const armWidth = 0.14;
      const armGeo = new THREE.BoxGeometry(armWidth, 0.42, dimensions.depthMeters);
      const leftArm = new THREE.Mesh(armGeo, mainMaterial);
      leftArm.position.set(-dimensions.widthMeters / 2 + armWidth / 2, 0.38, 0);
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, mainMaterial);
      rightArm.position.set(dimensions.widthMeters / 2 - armWidth / 2, 0.38, 0);
      rightArm.castShadow = true;
      group.add(rightArm);

      // Cushions with brand secondary accent
      const cushionMat = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 0.5 });
      const cushionGeo = new THREE.BoxGeometry((dimensions.widthMeters - armWidth * 2) / 2 - 0.04, 0.1, dimensions.depthMeters - 0.22);
      const c1 = new THREE.Mesh(cushionGeo, cushionMat);
      c1.position.set(-(dimensions.widthMeters - armWidth * 2) / 4, 0.42, 0.04);
      c1.castShadow = true;
      group.add(c1);

      const c2 = new THREE.Mesh(cushionGeo, cushionMat);
      c2.position.set((dimensions.widthMeters - armWidth * 2) / 4, 0.42, 0.04);
      c2.castShadow = true;
      group.add(c2);

      // 4 Tapered Teak Wood Legs
      const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.18, 16);
      const legPositions = [
        [-dimensions.widthMeters / 2 + 0.08, 0.09, -dimensions.depthMeters / 2 + 0.08],
        [dimensions.widthMeters / 2 - 0.08, 0.09, -dimensions.depthMeters / 2 + 0.08],
        [-dimensions.widthMeters / 2 + 0.08, 0.09, dimensions.depthMeters / 2 - 0.08],
        [dimensions.widthMeters / 2 - 0.08, 0.09, dimensions.depthMeters / 2 - 0.08]
      ];
      legPositions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, woodMaterial);
        leg.position.set(x, y, z);
        leg.castShadow = true;
        group.add(leg);
      });
      break;
    }

    case 'chair': {
      // Single Lounge Chair
      const seatGeo = new THREE.CylinderGeometry(dimensions.widthMeters / 2, dimensions.widthMeters / 2 * 0.95, 0.16, 32);
      const seat = new THREE.Mesh(seatGeo, mainMaterial);
      seat.position.y = 0.42;
      seat.castShadow = true;
      group.add(seat);

      // Curved Backrest
      const backGeo = new THREE.CylinderGeometry(dimensions.widthMeters / 2, dimensions.widthMeters / 2, 0.48, 32, 1, true, -Math.PI / 2, Math.PI);
      const backMat = new THREE.MeshStandardMaterial({ color: primaryColor, side: THREE.DoubleSide, roughness: 0.5 });
      const back = new THREE.Mesh(backGeo, backMat);
      back.position.set(0, 0.64, 0);
      back.castShadow = true;
      group.add(back);

      // Brass Cross Base & Legs
      const legGeo = new THREE.CylinderGeometry(0.018, 0.012, 0.42, 16);
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const leg = new THREE.Mesh(legGeo, goldMaterial);
        leg.position.set(Math.cos(angle) * 0.22, 0.21, Math.sin(angle) * 0.22);
        leg.rotation.z = Math.cos(angle) * -0.15;
        leg.rotation.x = Math.sin(angle) * 0.15;
        leg.castShadow = true;
        group.add(leg);
      }
      break;
    }

    case 'plant': {
      // Terracotta/Ceramic Planter Pot
      const potGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.45, 32);
      const potMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.35 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.225;
      pot.castShadow = true;
      pot.receiveShadow = true;
      group.add(pot);

      // Soil
      const soilGeo = new THREE.CircleGeometry(0.2, 32).rotateX(-Math.PI / 2);
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x26170d, roughness: 0.9 });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.44;
      group.add(soil);

      // Brass Stand
      const standGeo = new THREE.TorusGeometry(0.23, 0.012, 16, 32).rotateX(Math.PI / 2);
      const stand = new THREE.Mesh(standGeo, goldMaterial);
      stand.position.y = 0.2;
      group.add(stand);

      // Botanical Foliage Leaves
      const leafMat = new THREE.MeshStandardMaterial({ color: foliageGreen, roughness: 0.3, side: THREE.DoubleSide });
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x1d4027, roughness: 0.6 });

      for (let i = 0; i < 7; i++) {
        const angle = (i * Math.PI * 2) / 7;
        const leafStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.55, 8), stemMat);
        leafStem.position.set(Math.cos(angle) * 0.06, 0.65, Math.sin(angle) * 0.06);
        leafStem.rotation.z = Math.cos(angle) * 0.45;
        leafStem.rotation.x = Math.sin(angle) * -0.45;
        group.add(leafStem);

        const leafMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16).scale(1.2, 0.15, 2.2), leafMat);
        leafMesh.position.set(Math.cos(angle) * 0.28, 0.88, Math.sin(angle) * 0.28);
        leafMesh.rotation.y = angle;
        leafMesh.rotation.x = 0.3;
        leafMesh.castShadow = true;
        group.add(leafMesh);
      }
      break;
    }

    case 'vase': {
      // Artisanal Sculptural Urn / Vase
      const points = [];
      for (let i = 0; i < 15; i++) {
        const t = i / 14;
        const r = Math.sin(t * Math.PI) * 0.14 + (t > 0.7 ? 0.05 : 0.08);
        points.push(new THREE.Vector2(r, t * dimensions.heightMeters));
      }
      const vaseGeo = new THREE.LatheGeometry(points, 32);
      const vaseMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.2,
        metalness: 0.3
      });
      const vase = new THREE.Mesh(vaseGeo, vaseMat);
      vase.castShadow = true;
      group.add(vase);

      // Gold Rim Accent
      const rimGeo = new THREE.TorusGeometry(0.075, 0.008, 16, 32).rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, goldMaterial);
      rim.position.y = dimensions.heightMeters;
      group.add(rim);
      break;
    }

    case 'lamp': {
      // Marble/Metal Base
      const baseGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.04, 32);
      const base = new THREE.Mesh(baseGeo, goldMaterial);
      base.position.y = 0.02;
      group.add(base);

      // Slender Stem
      const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, dimensions.heightMeters * 0.7, 16);
      const stem = new THREE.Mesh(stemGeo, goldMaterial);
      stem.position.y = (dimensions.heightMeters * 0.7) / 2 + 0.04;
      group.add(stem);

      // Fluted Shade
      const shadeGeo = new THREE.CylinderGeometry(0.16, 0.28, 0.28, 32, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0xfef9f0,
        emissive: 0xffeedd,
        emissiveIntensity: 0.45,
        roughness: 0.6,
        side: THREE.DoubleSide
      });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.y = dimensions.heightMeters * 0.75;
      group.add(shade);
      break;
    }

    case 'wall-art': {
      // Outer Frame
      const frameMat = new THREE.MeshStandardMaterial({ color: accentGold, metalness: 0.85, roughness: 0.2 });
      const frameGeo = new THREE.BoxGeometry(dimensions.widthMeters, dimensions.heightMeters, 0.04);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = dimensions.heightMeters / 2;
      group.add(frame);

      // Canvas / Artwork Plane
      const canvasGeo = new THREE.PlaneGeometry(dimensions.widthMeters * 0.9, dimensions.heightMeters * 0.9);
      const canvasMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.7
      });
      const canvas = new THREE.Mesh(canvasGeo, canvasMat);
      canvas.position.set(0, dimensions.heightMeters / 2, 0.022);
      group.add(canvas);
      break;
    }

    default: {
      // Modern Center Table / Console
      const topGeo = new THREE.BoxGeometry(dimensions.widthMeters, 0.05, dimensions.depthMeters);
      const top = new THREE.Mesh(topGeo, woodMaterial);
      top.position.y = dimensions.heightMeters;
      top.castShadow = true;
      group.add(top);

      // Metal Frame Legs
      const legGeo = new THREE.CylinderGeometry(0.018, 0.018, dimensions.heightMeters, 16);
      const legOffsets = [
        [-dimensions.widthMeters / 2 + 0.06, dimensions.heightMeters / 2, -dimensions.depthMeters / 2 + 0.06],
        [dimensions.widthMeters / 2 - 0.06, dimensions.heightMeters / 2, -dimensions.depthMeters / 2 + 0.06],
        [-dimensions.widthMeters / 2 + 0.06, dimensions.heightMeters / 2, dimensions.depthMeters / 2 - 0.06],
        [dimensions.widthMeters / 2 - 0.06, dimensions.heightMeters / 2, dimensions.depthMeters / 2 - 0.06]
      ];
      legOffsets.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, goldMaterial);
        leg.position.set(x, y, z);
        leg.castShadow = true;
        group.add(leg);
      });
      break;
    }
  }

  return group;
}
