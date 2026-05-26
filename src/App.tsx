import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f1e8);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.far = 100;
    scene.add(directionalLight);

    // Add point lights for more depth
    const pointLight1 = new THREE.PointLight(0xffffff, 0.4, 50);
    pointLight1.position.set(-15, 10, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 50);
    pointLight2.position.set(15, -10, -15);
    scene.add(pointLight2);

    // Create enhanced 3D Matrix Data Structure with more complexity
    const createDataMatrix = () => {
      const group = new THREE.Group();
      const gridSize = 12;
      const spacing = 0.6;

      // Create main grid with varying geometries
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          for (let z = 0; z < gridSize; z++) {
            const size = Math.random() * 0.25 + 0.1;
            const geometry = new THREE.BoxGeometry(size, size, size);

            const isBlack = Math.random() > 0.4;
            const material = new THREE.MeshStandardMaterial({
              color: isBlack ? 0x000000 : 0xffffff,
              roughness: Math.random() * 0.4 + 0.2,
              metalness: Math.random() * 0.3 + 0.1,
              emissive: isBlack ? new THREE.Color(0x1a1a1a) : new THREE.Color(0xf0f0f0),
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              (x - gridSize / 2) * spacing,
              (y - gridSize / 2) * spacing,
              (z - gridSize / 2) * spacing
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Random rotation for visual complexity
            mesh.rotation.set(
              Math.random() * 0.5,
              Math.random() * 0.5,
              Math.random() * 0.5
            );

            group.add(mesh);
          }
        }
      }

      return group;
    };

    const dataMatrix = createDataMatrix();
    scene.add(dataMatrix);

    // Create multiple layers of animated particles with different speeds
    const createParticleSystem = () => {
      const layers = [];

      for (let layer = 0; layer < 3; layer++) {
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 800 - layer * 200;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * (20 + layer * 5);
          positions[i + 1] = (Math.random() - 0.5) * (20 + layer * 5);
          positions[i + 2] = (Math.random() - 0.5) * (20 + layer * 5);

          velocities[i] = (Math.random() - 0.5) * 0.02;
          velocities[i + 1] = (Math.random() - 0.5) * 0.02;
          velocities[i + 2] = (Math.random() - 0.5) * 0.02;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        (particlesGeometry as any).velocities = velocities;

        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.08 - layer * 0.02,
          color: layer === 0 ? 0x000000 : 0xffffff,
          transparent: true,
          opacity: 0.5 - layer * 0.1,
          sizeAttenuation: true,
        });

        const points = new THREE.Points(particlesGeometry, particlesMaterial);
        layers.push(points);
        scene.add(points);
      }

      return layers;
    };

    const particleLayers = createParticleSystem();

    // Create connecting lines for visual depth
    const createConnectingLines = () => {
      const group = new THREE.Group();
      const lineCount = 150;

      for (let i = 0; i < lineCount; i++) {
        const points = [];
        for (let j = 0; j < 3; j++) {
          points.push(
            new THREE.Vector3(
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 12
            )
          );
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: Math.random() > 0.5 ? 0x000000 : 0xffffff,
          transparent: true,
          opacity: 0.1 + Math.random() * 0.2,
          linewidth: 1,
        });

        const line = new THREE.Line(geometry, material);
        group.add(line);
      }

      return group;
    };

    const lines = createConnectingLines();
    scene.add(lines);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smooth continuous rotation with slight wobble
      dataMatrix.rotation.x += 0.0004;
      dataMatrix.rotation.y += 0.0007;
      dataMatrix.rotation.z += Math.sin(Date.now() * 0.001) * 0.00005;

      // Animate particles with velocity
      particleLayers.forEach((particles, index) => {
        particles.rotation.x += 0.0001 * (1 + index * 0.5);
        particles.rotation.y += 0.00015 * (1 + index * 0.5);

        const positions = particles.geometry.attributes.position.array as Float32Array;
        const velocities = (particles.geometry as any).velocities;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1];
          positions[i + 2] += velocities[i + 2];

          // Wrap around
          if (Math.abs(positions[i]) > 15) velocities[i] *= -1;
          if (Math.abs(positions[i + 1]) > 15) velocities[i + 1] *= -1;
          if (Math.abs(positions[i + 2]) > 15) velocities[i + 2] *= -1;
        }

        (particles.geometry.attributes.position as any).needsUpdate = true;
      });

      // Slowly rotate connecting lines
      lines.rotation.x += 0.00005;
      lines.rotation.y += 0.00008;

      renderer.render(scene, camera);
    };

    animate();

    // Scroll-triggered camera animation
    gsap.to(camera.position, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
      z: 20,
      ease: 'power1.inOut',
    });

    // Scroll-triggered rotation boost
    gsap.to(dataMatrix.rotation, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          dataMatrix.rotation.z += velocity * 0.00005;
        },
      },
    });

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="app" ref={containerRef}>
      <canvas ref={canvasRef} className="canvas"></canvas>

      <div className="overlay">
        <div className="section" style={{ height: '100vh' }}>
          <h1>Meridian</h1>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Crime Statistics</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Energy Loadshedding</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Water Supply</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Housing Data</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Real-time Updates</h2>
        </div>
      </div>
    </div>
  );
}
