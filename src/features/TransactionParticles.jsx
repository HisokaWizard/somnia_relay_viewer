import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { transactionModules } from '@/shared/transactionModules';

/**
 * ParticleStream
 *
 * Streams small spheres (particles) from coordinate A to B repeatedly.
 *
 * Props:
 * - start: [x,y,z] starting position
 * - end: [x,y,z] ending position
 * - particleCount: number of spheres (default 100)
 * - speed: speed factor (default 1)
 * - size: radius of spheres (default 0.05)
 */
export function TransactionParticles({ transactions, speed = 1, size = 0.05, spacing = 10 }) {
  const meshRef = useRef();
  const particles = useRef([]);

  useEffect(() => {
    const list = [];
    Object.entries(transactions).forEach(([module, count]) => {
      const startPos = transactionModules.find((it) => it.id === module)?.position || [0, 0, 0];
      const startVec = new THREE.Vector3(...startPos);
      for (let i = 0; i < count; i++) {
        list.push({ module, startVec, t: -(i / count) * spacing });
      }
    });
    particles.current = list;
    if (meshRef.current) meshRef.current.count = 0;
  }, [transactions, spacing]);

  const endVec = useMemo(() => new THREE.Vector3(...transactionModules[6].position), []);

  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(size, 8, 8), [size]);

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#00aaff', emissive: '#005577' }),
    [],
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const matrix = new THREE.Matrix4();
    let visible = 0;
    particles.current.forEach((p) => {
      p.t += delta * speed;
      if (p.t < 0 || p.t > 1) return;
      const pos = p.startVec.clone().lerp(endVec, p.t);
      matrix.setPosition(pos);
      meshRef.current.setMatrixAt(visible++, matrix);
    });
    meshRef.current.count = visible;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[sphereGeometry, material, particles.current.length]} />
  );
}
