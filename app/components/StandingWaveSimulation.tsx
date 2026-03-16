'use client'

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Wavelength {
  id: number;
  frequency: number;
  amplitude: number;
  enabled: boolean;
}

const SEGMENT_COUNT = 300;
const WAVE_LENGTH = 20;
const FREQUENCY = 0.05;

const createSingleWaveGeometry = (time: number, config: Wavelength) => {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= SEGMENT_COUNT; i++) {
    const x = (i / SEGMENT_COUNT) * WAVE_LENGTH - WAVE_LENGTH / 2;
    // For a box from -L/2 to +L/2, eigenstate is sin(nπ(x + L/2)/L)
    // Phase scales with n² (energy scales as n²)
    const waveNumber = (Math.PI * config.frequency) / WAVE_LENGTH;
    const phase = time * FREQUENCY * Math.pow(config.frequency, 2);
    
    const y = Math.sin(waveNumber * (x + WAVE_LENGTH / 2)) * Math.cos(phase) * config.amplitude;
    
    points.push(new THREE.Vector3(x, y, 0));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
};

const createSuperpositionGeometry = (time: number, waveConfigs: Wavelength[]) => {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= SEGMENT_COUNT; i++) {
    const x = (i / SEGMENT_COUNT) * WAVE_LENGTH - WAVE_LENGTH / 2;
    let y = 0;

    // Sum all enabled wavelengths with proper phase scaling
    waveConfigs.forEach((config) => {
      if (config.enabled) {
        // For a box from -L/2 to +L/2, eigenstate is sin(nπ(x + L/2)/L)
        // Phase scales with n² (energy scales as n²)
        const waveNumber = (Math.PI * config.frequency) / WAVE_LENGTH;
        const phase = time * FREQUENCY * Math.pow(config.frequency, 2);
        y += Math.sin(waveNumber * (x + WAVE_LENGTH / 2)) * Math.cos(phase) * config.amplitude;
      }
    });
    
    points.push(new THREE.Vector3(x, y, 0));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
};

export const StandingWaveSimulation: React.FC<{
  wavelengths: Wavelength[];
  setWavelengths: (wavelengths: Wavelength[]) => void;
}> = ({ wavelengths: externalWavelengths, setWavelengths: setExternalWavelengths }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const linesRef = useRef<THREE.Object3D[]>([]);
  const materialsRef = useRef<THREE.LineBasicMaterial[]>([]);
  const superpositionMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const wavelengthsRef = useRef<Wavelength[]>(externalWavelengths);
  const [wavelengths, setWavelengths] = useState<Wavelength[]>(externalWavelengths);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Camera setup - positioned from top-left looking at the wave
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(-20, 15, 20);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const dpr = window.devicePixelRatio || 1;
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(12, 15, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.bias = -0.0008;
    directionalLight.shadow.camera.far = 80;
    scene.add(directionalLight);

    // Ground plane for shadow
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.6 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grid helper for reference
    const gridHelper = new THREE.GridHelper(30, 15, 0x444444, 0x222222);
    gridHelper.position.y = -2.1;
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.scale.set(1, 1, 0.1);
    scene.add(gridHelper);

    // Add axes helper (X: red, Y: green, Z: blue)
    const axesHelper = new THREE.AxesHelper(12);
    scene.add(axesHelper);

    // Create materials for individual wavelengths (store colors)
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf, 0xdda0dd, 0x87ceeb, 0xffa07a];

    // Clean up old meshes
    linesRef.current.forEach(line => scene.remove(line));
    linesRef.current = [];

    // Create individual wavelength tubes (in background)
    wavelengthsRef.current.forEach((config, index) => {
      const geo = createSingleWaveGeometry(0, config);
      const positions = geo.attributes.position.array as Float32Array;
      const points: THREE.Vector3[] = [];
      
      for (let i = 0; i < positions.length; i += 3) {
        points.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, SEGMENT_COUNT, 0.15, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: colors[index % colors.length],
        metalness: 0.3,
        roughness: 0.6,
        transparent: true,
        opacity: 0.5,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.z = -5 - index * 1.5; // Space them out in the background
      tube.castShadow = true;
      tube.receiveShadow = true;
      scene.add(tube);
      linesRef.current.push(tube);
    });

    // Create superposition tube (at front)
    let superpositionGeometry = createSuperpositionGeometry(0, wavelengthsRef.current);
    const superposPositions = superpositionGeometry.attributes.position.array as Float32Array;
    const superposPoints: THREE.Vector3[] = [];
    
    for (let i = 0; i < superposPositions.length; i += 3) {
      superposPoints.push(new THREE.Vector3(superposPositions[i], superposPositions[i + 1], superposPositions[i + 2]));
    }
    
    const superposCurve = new THREE.CatmullRomCurve3(superposPoints);
    const superposTubeGeo = new THREE.TubeGeometry(superposCurve, SEGMENT_COUNT, 0.2, 8, false);
    const superposTubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.5,
      emissive: 0x4da6ff,
      emissiveIntensity: 0.2,
    });
    const superposTube = new THREE.Mesh(superposTubeGeo, superposTubeMat);
    superposTube.position.z = 0;
    superposTube.castShadow = true;
    superposTube.receiveShadow = true;
    scene.add(superposTube);
    linesRef.current.push(superposTube);

    // Animation loop
    const animate = () => {
      timeRef.current += 1;
      
      if (sceneRef.current) {
        // Update individual wavelength tubes
        wavelengthsRef.current.forEach((config, index) => {
          if (index < linesRef.current.length - 1) {
            const tube = linesRef.current[index];
            scene.remove(tube);
            
            // Create new geometry
            const geo = createSingleWaveGeometry(timeRef.current, config);
            const positions = geo.attributes.position.array as Float32Array;
            const points: THREE.Vector3[] = [];
            
            for (let i = 0; i < positions.length; i += 3) {
              points.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
            }
            
            const curve = new THREE.CatmullRomCurve3(points);
            const tubeGeo = new THREE.TubeGeometry(curve, SEGMENT_COUNT, 0.15, 8, false);
            const newTube = new THREE.Mesh(tubeGeo, ((tube as THREE.Mesh).material as THREE.Material));
            newTube.position.z = -5 - index * 1.5;
            newTube.castShadow = true;
            newTube.receiveShadow = true;
            scene.add(newTube);
            linesRef.current[index] = newTube;
          }
        });

        // Update superposition tube (last one)
        const superTube = linesRef.current[linesRef.current.length - 1];
        if (superTube) {
          scene.remove(superTube);
          
          const newGeo = createSuperpositionGeometry(timeRef.current, wavelengthsRef.current);
          const positions = newGeo.attributes.position.array as Float32Array;
          const points: THREE.Vector3[] = [];
          
          for (let i = 0; i < positions.length; i += 3) {
            points.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
          }
          
          const curve = new THREE.CatmullRomCurve3(points);
          const tubeGeo = new THREE.TubeGeometry(curve, SEGMENT_COUNT, 0.2, 8, false);
          const newSuperTube = new THREE.Mesh(tubeGeo, ((superTube as THREE.Mesh).material as THREE.Material));
          newSuperTube.position.z = 0;
          newSuperTube.castShadow = true;
          newSuperTube.receiveShadow = true;
          scene.add(newSuperTube);
          linesRef.current[linesRef.current.length - 1] = newSuperTube;
        }

      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      linesRef.current.forEach(line => {
        const geo = line.geometry as THREE.BufferGeometry;
        geo.dispose();
      });
      superpositionMaterialRef.current?.dispose();
      materialsRef.current.forEach(mat => mat.dispose());
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Sync with external wavelengths
  useEffect(() => {
    setWavelengths(externalWavelengths);
    wavelengthsRef.current = externalWavelengths;
  }, [externalWavelengths]);

  // Sync wavelengths state with ref and recreate lines when count changes
  useEffect(() => {
    wavelengthsRef.current = wavelengths;
    
    // Recreate lines if the scene is ready and wavelength count changed
    if (sceneRef.current && wavelengths.length !== linesRef.current.length - 1) {
      // Remove old lines from scene
      linesRef.current.slice(0, -1).forEach(line => sceneRef.current?.remove(line));
      
      // Create new materials
      const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf, 0xdda0dd, 0x87ceeb, 0xffa07a];
      const newMaterials = wavelengths.map((_, i) =>
        new THREE.LineBasicMaterial({
          color: colors[i % colors.length],
          linewidth: 2,
          transparent: true,
          opacity: 0.4,
        })
      );
      
      // Clean up old materials
      materialsRef.current.forEach(mat => mat.dispose());
      materialsRef.current = newMaterials;
      
      // Recreate individual wavelength lines
      const newLines: THREE.Line[] = [];
      wavelengths.forEach((config, index) => {
        const geo = new THREE.BufferGeometry(); // Empty for now, will be updated in animate
        const line = new THREE.Line(geo, newMaterials[index]);
        line.position.z = -5 - index * 1.5;
        line.castShadow = true;
        sceneRef.current?.add(line);
        newLines.push(line);
      });
      
      // Keep the superposition line (last one)
      if (linesRef.current.length > 0) {
        sceneRef.current?.remove(linesRef.current[linesRef.current.length - 1]);
      }
      const superpositionLine = new THREE.Line(new THREE.BufferGeometry(), superpositionMaterialRef.current!);
      superpositionLine.position.z = 0;
      superpositionLine.castShadow = true;
      sceneRef.current?.add(superpositionLine);
      newLines.push(superpositionLine);
      
      linesRef.current = newLines;
    }
  }, [wavelengths]);

  const addWavelength = () => {
    const newId = Math.max(...wavelengths.map(w => w.id), 0) + 1;
    const updated = [...wavelengths, {
      id: newId,
      frequency: wavelengths.length + 1,
      amplitude: 2,
      enabled: true
    }];
    setWavelengths(updated);
    setExternalWavelengths(updated);
  };

  const removeWavelength = (id: number) => {
    if (wavelengths.length > 1) {
      const updated = wavelengths.filter(w => w.id !== id);
      setWavelengths(updated);
      setExternalWavelengths(updated);
    }
  };

  const updateWavelength = (id: number, updates: Partial<Wavelength>) => {
    const updated = wavelengths.map(w =>
      w.id === id ? { ...w, ...updates } : w
    );
    setWavelengths(updated);
    setExternalWavelengths(updated);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <div ref={containerRef} className="flex-1" />
      <div className="bg-slate-900 border-t border-slate-700 p-4 max-h-64 overflow-y-auto">
        <div className="space-y-3">
          <h2 className="text-white font-bold">Wavelengths</h2>
          {wavelengths.map((w) => (
            <div key={w.id} className="bg-slate-800 p-3 rounded space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={w.enabled}
                  onChange={(e) => updateWavelength(w.id, { enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white flex-1">Wavelength {w.id}</span>
                {wavelengths.length > 1 && (
                  <button
                    onClick={() => removeWavelength(w.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div>
                <label className="text-slate-300 text-sm">Quantum Number (n): {Math.round(w.frequency)}</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={Math.round(w.frequency)}
                  onChange={(e) => updateWavelength(w.id, { frequency: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm">Amplitude: {w.amplitude}</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={w.amplitude}
                  onChange={(e) => updateWavelength(w.id, { amplitude: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded cursor-pointer accent-green-500"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addWavelength}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
          >
            + Add Wavelength
          </button>
        </div>
      </div>
    </div>
  );
};

