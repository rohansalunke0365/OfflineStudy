import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Vault3DBackgroundProps {
  opacity?: number;
  interactive?: boolean;
}

export const Vault3DBackground = ({ opacity = 0.45, interactive = true }: Vault3DBackgroundProps) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Floating 3D 'Vault' Plates Group
    const group = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(2.4, 2.4, 0.08);
    
    // Create dual materials for metallic bevel finish
    const amberMat = new THREE.MeshPhongMaterial({
      color: 0xe8a33d,
      shininess: 120,
      specular: 0xffd580,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });

    const darkMat = new THREE.MeshPhongMaterial({
      color: 0x22242a,
      shininess: 90,
      specular: 0x555560,
      transparent: true,
      opacity: 0.65,
    });

    // Spawn 7 floating geometric vault plates
    for (let i = 0; i < 7; i++) {
      const mat = i % 2 === 0 ? amberMat : darkMat;
      const plate = new THREE.Mesh(plateGeo, mat);
      plate.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        -Math.random() * 6 - 1
      );
      plate.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      plate.scale.setScalar(0.7 + Math.random() * 0.7);
      group.add(plate);
    }

    // Add subtle ambient floating particle field for depth
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = (Math.random() - 0.5) * 12;
      posArray[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xffb956,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    scene.add(group);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xe8a33d, 2.5, 50);
    amberLight.position.set(4, 4, 6);
    scene.add(amberLight);

    const cyanLight = new THREE.PointLight(0x00f2ff, 1.8, 50);
    cyanLight.position.set(-5, -3, 4);
    scene.add(cyanLight);

    // Mouse movement parallax
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = x * 0.4;
      targetY = y * 0.3;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.x += 0.003;
      group.rotation.y += 0.004;

      particles.rotation.y -= 0.001;

      // Parallax smooth interpolation
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      plateGeo.dispose();
      amberMat.dispose();
      darkMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container) container.innerHTML = '';
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity }}
    />
  );
};
