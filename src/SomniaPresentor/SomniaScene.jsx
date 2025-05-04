import React, { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, Plane } from '@react-three/drei';
import * as THREE from 'three';

const modules = [
  { id: 1, name: 'Consensus Mechanism', position: [-2, 0, 0], color: 'blue' },
  { id: 2, name: 'Database (IceDB)', position: [2, 0, 0], color: 'red' },
  { id: 3, name: 'EVM Optimization', position: [0, 0, -2], color: 'yellow' },
  { id: 4, name: 'Ecosystem Partners', position: [2, 0, -2], color: 'green' },
  { id: 5, name: 'Transaction Visualization', position: [-2, 0, -2], color: 'purple' },
];

export const SomniaScene = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const moduleMeshes = useRef([]);
  const { camera } = useThree();

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

  useFrame(() => {
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
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Plane rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]}>
        <meshStandardMaterial color='gray' />
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
        <html>
          <div
            style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: 10 }}
          >
            {selectedModule.name}
          </div>
        </html>
      )}
    </>
  );
};
