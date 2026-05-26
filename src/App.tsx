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
    scene.background = new THREE.Color(0xf5f1e8); // Beige
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create 3D Matrix Data Structure
    const createDataMatrix = () => {
      const group = new THREE.Group();
      const gridSize = 8;
      const spacing = 0.5;

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          for (let z = 0; z < gridSize; z++) {
            const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
            const material = new THREE.MeshStandardMaterial({
              color: Math.random() > 0.5 ? 0x000000 : 0xffffff,
              roughness: 0.5,
              metalness: 0.3,
              emissive: Math.random() > 0.7 ? 0x000000 : 0x000000,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              (x - gridSize / 2) * spacing,
              (y - gridSize / 2) * spacing,
              (z - gridSize / 2) * spacing
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            group.add(mesh);
          }
        }
      }

      return group;
    };

    const dataMatrix = createDataMatrix();
    scene.add(dataMatrix);

    // Create animated particles
    const createParticles = () => {
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = 1000;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        color: 0x000000,
        transparent: true,
        opacity: 0.6,
      });

      return new THREE.Points(particlesGeometry, particlesMaterial);
    };

    const particles = createParticles();
    scene.add(particles);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      dataMatrix.rotation.x += 0.0005;
      dataMatrix.rotation.y += 0.001;

      particles.rotation.x += 0.0002;
      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    // Scroll animations
    gsap.to(dataMatrix.rotation, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          dataMatrix.rotation.z = self.getVelocity() * 0.0001;
        },
      },
      y: Math.PI * 2,
      duration: 1,
    });

    gsap.to(camera.position, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
      z: 15,
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

    // Keyboard controls
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const controlSpeed = 0.05;
    const controlLoop = setInterval(() => {
      if (keys['arrowup'] || keys['w']) dataMatrix.position.y += controlSpeed;
      if (keys['arrowdown'] || keys['s']) dataMatrix.position.y -= controlSpeed;
      if (keys['arrowleft'] || keys['a']) dataMatrix.position.x -= controlSpeed;
      if (keys['arrowright'] || keys['d']) dataMatrix.position.x += controlSpeed;
      if (keys['q']) dataMatrix.rotation.z += 0.05;
      if (keys['e']) dataMatrix.rotation.z -= 0.05;
    }, 16);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(controlLoop);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="app">
      <canvas ref={canvasRef} className="canvas"></canvas>

      <div className="overlay">
        <div className="section" style={{ height: '100vh' }}>
          <h1>Meridian</h1>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Crime Data</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Energy Flow</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Water Systems</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Housing Metrics</h2>
        </div>

        <div className="section" style={{ height: '100vh' }}>
          <h2>Real-time Updates</h2>
        </div>

        <div className="controls">
          <p>WASD / Arrows to move</p>
          <p>Q / E to rotate</p>
          <p>Scroll to explore</p>
        </div>
      </div>
    </div>
  );
}
