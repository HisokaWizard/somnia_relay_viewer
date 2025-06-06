import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame, useLoader } from '@react-three/fiber';
import { PointerLockControls, Plane, Html } from '@react-three/drei';
import { useNavigate } from 'react-router';
import * as THREE from 'three';
import { MainSceneModule, modules } from '@/shared/generalModules';
import { lines } from '@/shared/lines';
import { BezierLine } from '@/features/BezierLine';
import { MeshReflectorMaterial } from '@react-three/drei';
import { Model3DTemplate } from '@/features/3DModels';
import { MeshWrapper } from '@/shared';

const textureURL = `${process.env.BASE_URL}textures/technic.jpg`;

type MeshLocalWrapper = THREE.Mesh<
  THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  THREE.Material | THREE.Material[],
  THREE.Object3DEventMap
>;

export const SomniaScene = () => {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const [hoveredModule, setHoveredModule] = useState<MainSceneModule | null>(
    null
  );
  const moduleMeshes = useRef<MeshLocalWrapper[]>([]);
  const previousHighlighted =
    useRef<THREE.Object3D<THREE.Object3DEventMap> | null>(null);
  const aimPointRef = useRef<MeshWrapper | null>(null);
  const { camera, scene } = useThree();
  const navigate = useNavigate();
  const texture = useLoader(THREE.TextureLoader, textureURL);

  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    scene.background = texture;
    scene.environment = texture;
    camera.rotation.set(0.2, 0, 0);
  }, [scene, texture, camera]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
        case 'Enter':
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
          const intersects = raycaster.intersectObjects(
            moduleMeshes.current,
            true
          );
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            const selectedId = hit.userData.id ?? hit.parent?.userData.id;
            const module = modules.find((m) => m.id === selectedId);
            if (module) {
              navigate(`/${module.id}`);
            }
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
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

    const MIN_X = -8;
    const MAX_X = 8;
    const MIN_Z = -8;
    const MAX_Z = 8;
    camera.position.x = Math.max(MIN_X, Math.min(MAX_X, camera.position.x));
    camera.position.z = Math.max(MIN_Z, Math.min(MAX_Z, camera.position.z));
    camera.position.y = 3;

    const time = state.clock.getElapsedTime();

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(moduleMeshes.current, true);

    if (aimPointRef.current) {
      let hitPoint = camera.position.clone().addScaledVector(direction, 5);
      let pulse = 0.3;

      if (intersects.length > 0) {
        hitPoint = intersects[0].point;
        hitPoint.y += 0.01;
        pulse = 0.3 + 0.1 * Math.sin(time * 5);

        const hit = intersects[0].object;
        const selectedId = hit.userData.id ?? hit.parent?.userData.id;
        const module = modules.find((m) => m.id === selectedId);
        setHoveredModule(module || null);
      } else {
        setHoveredModule(null);
      }

      aimPointRef.current.position.copy(hitPoint);
      aimPointRef.current.scale.set(pulse, pulse, pulse);
    }

    let prevHighlighted = previousHighlighted.current as any;
    if (intersects.length > 0) {
      const newHighlighted = intersects[0].object;

      if (newHighlighted !== previousHighlighted.current) {
        if (prevHighlighted) {
          prevHighlighted.material.emissive.set(0x000000);
          prevHighlighted.material.emissiveIntensity = 0;
        }
        (newHighlighted as any).material.emissive.set(0xff0000);
        (newHighlighted as any).material.emissiveIntensity = 1;
        prevHighlighted = newHighlighted;
      }
    } else {
      if (previousHighlighted.current) {
        prevHighlighted.material.emissive.set(0x000000);
        prevHighlighted.material.emissiveIntensity = 0;
        prevHighlighted = null;
      }
    }

    if (prevHighlighted) {
      const intensity = 0.5 + 0.5 * Math.sin(state.clock.getElapsedTime() * 5);
      prevHighlighted.material.emissiveIntensity = intensity;
    }
  });

  const modulesRender = useMemo(
    () =>
      modules.map((module, index) => (
        <mesh
          key={module.id}
          ref={(el) => {
            if (!el) return;
            moduleMeshes.current[index] = el;
          }}
          position={[
            module.position[0],
            module.position[1],
            module.position[2],
          ]}
          userData={{ id: module.id }}
        >
          <Model3DTemplate id={module.id} {...module.model} />
        </mesh>
      )),
    []
  );

  const logoLines = useMemo(
    () =>
      lines.map((line, index) => {
        return (
          <BezierLine
            key={index}
            start={line.start}
            end={line.end}
            color={line.color}
            width={line.width}
            curvature={line.curvature}
          />
        );
      }),
    []
  );

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} />

      <Plane name="floor" rotation={[-Math.PI / 2, 0, 0]} args={[100, 100]}>
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={0.8}
          roughness={0.1}
          metalness={0.9}
          mirror={0.5}
          side={2}
        />
      </Plane>

      <mesh ref={aimPointRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {modulesRender}
      {logoLines}

      {hoveredModule && (
        <Html
          style={{
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: '8px',
          }}
          position={[
            hoveredModule.position[0],
            hoveredModule.position[1],
            hoveredModule.position[2],
          ]}
        >
          <h3 style={{ color: 'white' }}>{hoveredModule.description}</h3>
        </Html>
      )}

      <PointerLockControls />
    </>
  );
};
