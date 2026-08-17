import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCw, ZoomIn, ZoomOut, Maximize2, Activity } from 'lucide-react';

interface ThermodynamicsCanvasProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  title?: string;
  subtitle?: string;
}

export const ThermodynamicsCanvas = ({
  isPlaying,
  onTogglePlay,
  title = "Entropy Analysis - Stator Vane Segment V7",
  subtitle = "High-Temperature Thermodynamic Flux & Microstate Dispersion"
}: ThermodynamicsCanvasProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [heatIntensity, setHeatIntensity] = useState(1.2);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070a, 0.035);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 4.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x06070a, 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 1. Grid Floor for high-tech laboratory backdrop
    const gridHelper = new THREE.GridHelper(16, 32, 0x00f2ff, 0x1f293d);
    gridHelper.position.y = -1.6;
    scene.add(gridHelper);

    // 2. Central Stator Vane Cage (Cylindrical metallic lattice)
    const statorGroup = new THREE.Group();

    // Outer cylindrical cage rings and struts
    const radius = 1.1;
    const cageHeight = 1.8;
    const ringGeo = new THREE.TorusGeometry(radius, 0.06, 16, 48);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xc8c6c8,
      metalness: 0.95,
      roughness: 0.25,
      wireframe: wireframeMode,
    });

    const topRing = new THREE.Mesh(ringGeo, metalMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = cageHeight / 2;
    statorGroup.add(topRing);

    const bottomRing = new THREE.Mesh(ringGeo, metalMat);
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.y = -cageHeight / 2;
    statorGroup.add(bottomRing);

    // Diagonal Cross-Struts (Lattice)
    const strutCount = 8;
    for (let i = 0; i < strutCount; i++) {
      const angle = (i / strutCount) * Math.PI * 2;
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const nextAngle = ((i + 1) / strutCount) * Math.PI * 2;
      const x2 = Math.cos(nextAngle) * radius;
      const z2 = Math.sin(nextAngle) * radius;

      // Diagonal 1
      const strutGeo = new THREE.CylinderGeometry(0.045, 0.045, cageHeight * 1.15, 12);
      const strut1 = new THREE.Mesh(strutGeo, metalMat);
      strut1.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
      strut1.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x2 - x1, cageHeight, z2 - z1).normalize()
      );
      statorGroup.add(strut1);

      // Diagonal 2 (opposing)
      const strut2 = new THREE.Mesh(strutGeo, metalMat);
      strut2.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
      strut2.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x1 - x2, cageHeight, z1 - z2).normalize()
      );
      statorGroup.add(strut2);
    }

    // 3. Glowing Amber Heat Core (Thermodynamic entropy center)
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff7700,
      emissive: 0xff5500,
      emissiveIntensity: 2.2 * heatIntensity,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.9,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    statorGroup.add(core);

    scene.add(statorGroup);

    // 4. Swirling Cyan/Cyan-Amber Entropy Particle Field
    const particleCount = 1200;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities: { radius: number; angle: number; y: number; speed: number; ySpeed: number }[] = [];

    const colorAmber = new THREE.Color(0xffaa22);
    const colorCyan = new THREE.Color(0x00f2ff);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 1.8;
      const y = (Math.random() - 0.5) * 3;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      // Color interpolation from central amber to outer radiant cyan
      const ratio = Math.min(1, r / 1.6);
      const mixedColor = colorAmber.clone().lerp(colorCyan, ratio);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      velocities.push({
        radius: r,
        angle: angle,
        y: y,
        speed: (0.015 + Math.random() * 0.02) * (r < 0.9 ? 1.5 : 1),
        ySpeed: (Math.random() - 0.5) * 0.012,
      });
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    // 5. Studio Lights
    const ambLight = new THREE.AmbientLight(0x223344, 1.2);
    scene.add(ambLight);

    const amberLight = new THREE.PointLight(0xff9900, 4, 12);
    amberLight.position.set(0, 0, 0);
    scene.add(amberLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 2.5);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Interactive Drag Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.2;
    let rotY = 0.4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let time = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.02;
        statorGroup.rotation.y += 0.009;
        statorGroup.rotation.x = Math.sin(time * 0.5) * 0.15 + rotX;
        statorGroup.rotation.z = Math.cos(time * 0.4) * 0.1;
      } else {
        statorGroup.rotation.x = rotX;
        statorGroup.rotation.y = rotY;
      }

      // Animate turbulent particles
      const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        if (isPlaying) {
          velocities[i].angle += velocities[i].speed;
          velocities[i].y += velocities[i].ySpeed;

          // Wrap boundaries
          if (velocities[i].y > 2.0) velocities[i].y = -2.0;
          if (velocities[i].y < -2.0) velocities[i].y = 2.0;
        }

        const r = velocities[i].radius + Math.sin(time + i) * 0.08;
        array[i * 3] = Math.cos(velocities[i].angle) * r;
        array[i * 3 + 1] = velocities[i].y;
        array[i * 3 + 2] = Math.sin(velocities[i].angle) * r;
      }
      posAttr.needsUpdate = true;

      // Pulse core
      core.scale.setScalar(1 + Math.sin(time * 3) * 0.04 * heatIntensity);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      gridHelper.dispose();
      ringGeo.dispose();
      metalMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      if (container) container.innerHTML = '';
    };
  }, [isPlaying, wireframeMode, heatIntensity]);

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newZoom = Math.max(0.5, Math.min(2.5, zoomLevel + delta));
    setZoomLevel(newZoom);
    cameraRef.current.position.z = 4.8 / newZoom;
  };

  const handleResetView = () => {
    if (!cameraRef.current) return;
    setZoomLevel(1);
    cameraRef.current.position.set(0, 1.8, 4.8);
    cameraRef.current.lookAt(0, 0, 0);
  };

  return (
    <div className="relative w-full h-full bg-[#06070a] overflow-hidden flex flex-col group select-none">
      {/* 3D Canvas viewport */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top 3D Simulation Overlay HUD (matching Image 2 header) */}
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-[#00f2ff] tracking-wider uppercase drop-shadow">
            StudyVault 3D Player • Real-Time CFD
          </span>
          <h2 className="text-white text-base font-bold tracking-tight drop-shadow-md">
            {title}
          </h2>
        </div>

        {/* 3D HUD Toolbars */}
        <div className="flex items-center gap-1.5 bg-[#121316]/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg pointer-events-auto">
          <button
            onClick={handleResetView}
            title="Reset Camera"
            className="p-1.5 text-[#9a9ba2] hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <RotateCw size={15} />
          </button>
          <button
            onClick={() => handleZoom(0.2)}
            title="Zoom In"
            className="p-1.5 text-[#9a9ba2] hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            title="Zoom Out"
            className="p-1.5 text-[#9a9ba2] hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            title="Toggle Wireframe Mesh"
            className={`p-1.5 rounded transition-colors ${wireframeMode ? 'text-[#ffb956] bg-[#ffb956]/20' : 'text-[#9a9ba2] hover:text-white hover:bg-white/10'}`}
          >
            <Activity size={15} />
          </button>
          <button
            onClick={() => setHeatIntensity(heatIntensity === 1.2 ? 2.0 : 1.2)}
            title="Boost Thermal Gradient"
            className={`p-1.5 text-xs font-mono font-bold rounded px-2 transition-colors ${heatIntensity > 1.5 ? 'text-[#e8a33d] bg-[#e8a33d]/20 border border-[#e8a33d]/40' : 'text-[#9a9ba2] hover:text-white hover:bg-white/10'}`}
          >
            {heatIntensity > 1.5 ? '🔥 MAX' : '🔥 NORM'}
          </button>
        </div>
      </div>

      {/* Floating Center Play/Pause indicator on click */}
      <div 
        onClick={onTogglePlay}
        className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
      >
        {!isPlaying && (
          <div className="w-16 h-16 rounded-full bg-[#e8a33d] text-[#121316] flex items-center justify-center shadow-[0_0_30px_rgba(232,163,61,0.7)] transform scale-100 hover:scale-110 transition-transform">
            <Play size={28} className="ml-1 fill-current" />
          </div>
        )}
      </div>

      {/* Bottom HUD info */}
      <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center text-[11px] font-mono text-[#9a9ba2] pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#00f2ff]">
            <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse"></span>
            GPU 60 FPS • FLUID DYNAMICS ACTIVE
          </span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden sm:inline text-white/70">Drag with mouse to rotate perspective</span>
        </div>
        <div className="text-white/60">
          T = 1420 K • ΔS = +4.82 J/(mol·K)
        </div>
      </div>
    </div>
  );
};
