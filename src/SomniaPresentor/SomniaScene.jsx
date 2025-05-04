import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, Plane, Html } from '@react-three/drei';
import { useNavigate } from 'react-router';
import * as THREE from 'three';
import { modules } from './modules';

export const SomniaScene = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const moduleMeshes = useRef([]);
  const previousHighlighted = useRef(null);
  const { camera, scene } = useThree();
  const navigate = useNavigate();

  useEffect(() => {
    scene.background = new THREE.Color('#111111');
  }, [scene]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'w':
          setKeys((prev) => ({ ...prev, forward: true }));
          break;
        case 's':
          setKeys((prev) => ({ ...prev, backward: true }));
          break;
        case 'a':
          setKeys((prev) => ({ ...prev, left: true }));
          break;
        case 'd':
          setKeys((prev) => ({ ...prev, right: true }));
          break;
        case ' ':
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
          const intersects = raycaster.intersectObjects(moduleMeshes.current);
          if (intersects.length > 0) {
            const selectedId = intersects[0].object.userData.id;
            const module = modules.find((m) => m.id === selectedId);
            setSelectedModule(module);
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case 'w':
          setKeys((prev) => ({ ...prev, forward: false }));
          break;
        case 's':
          setKeys((prev) => ({ ...prev, backward: false }));
          break;
        case 'a':
          setKeys((prev) => ({ ...prev, left: false }));
          break;
        case 'd':
          setKeys((prev) => ({ ...prev, right: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  useFrame((state) => {
    const speed = 0.1;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    if (keys.forward) {
      camera.position.addScaledVector(direction, speed);
    }
    if (keys.backward) {
      camera.position.addScaledVector(direction, -speed);
    }
    if (keys.left) {
      const left = new THREE.Vector3();
      left.crossVectors(camera.up, direction).normalize();
      camera.position.addScaledVector(left, speed);
    }
    if (keys.right) {
      const right = new THREE.Vector3();
      right.crossVectors(direction, camera.up).normalize();
      camera.position.addScaledVector(right, speed);
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(moduleMeshes.current);
    if (intersects.length > 0) {
      const newHighlighted = intersects[0].object;
      if (newHighlighted !== previousHighlighted.current) {
        if (previousHighlighted.current) {
          previousHighlighted.current.material.emissive.set(0x000000);
          previousHighlighted.current.material.emissiveIntensity = 0;
        }
        newHighlighted.material.emissive.set(0xff0000);
        newHighlighted.material.emissiveIntensity = 1;
        previousHighlighted.current = newHighlighted;
      }
    } else {
      if (previousHighlighted.current) {
        previousHighlighted.current.material.emissive.set(0x000000);
        previousHighlighted.current.material.emissiveIntensity = 0;
        previousHighlighted.current = null;
      }
    }

    if (previousHighlighted.current) {
      const intensity = 0.5 + 0.5 * Math.sin(state.clock.getElapsedTime() * 5);
      previousHighlighted.current.material.emissiveIntensity = intensity;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} />
      <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]}>
        <meshStandardMaterial color='black' />
      </Plane>
      {modules.map((module, index) => (
        <mesh
          key={module.id}
          ref={(el) => (moduleMeshes.current[index] = el)}
          position={[module.position[0], 0.5, module.position[2]]}
          userData={{ id: module.id }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={module.color} />
        </mesh>
      ))}
      <PointerLockControls />
      {selectedModule && (
        <Html>
          <div className='absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 text-white flex items-center justify-center'>
            <div className='bg-gray-800 p-6 rounded-lg'>
              <h1 className='text-2xl'>{selectedModule.name}</h1>
              <p>{selectedModule.description}</p>
              <button
                className='mt-4 bg-blue-500 text-white px-4 py-2 rounded'
                onClick={() => navigate(`/module/${selectedModule.id}`)}
              >
                Go to details
              </button>
              <button
                className='mt-4 ml-2 bg-red-500 text-white px-4 py-2 rounded'
                onClick={() => setSelectedModule(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Html>
      )}
    </>
  );
};
