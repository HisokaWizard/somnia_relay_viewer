import React, { useRef, useMemo, useEffect } from 'react';
import { InstancedMeshProps, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  TransactionClasters,
  transactionModules,
} from '@/shared/transactionModules';
import { MeshWrapper } from '@/shared';

interface ParticleList {
  module: string;
  startVec: THREE.Vector3;
  t: number;
}

interface TransactionParticlesProps {
  transactions: TransactionClasters;
  speed: number;
  size: number;
  spacing: number;
}

type MeshRef = THREE.InstancedMesh<
  THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  THREE.Material | THREE.Material[],
  THREE.InstancedMeshEventMap
>;

export const TransactionParticles = ({
  transactions,
  speed = 1,
  size = 0.05,
  spacing = 10,
}: TransactionParticlesProps) => {
  const meshRef = useRef<MeshRef | null>(null);
  const particles = useRef<ParticleList[]>([]);

  useEffect(() => {
    const list: ParticleList[] = [];
    Object.entries(transactions).forEach(([module, count]) => {
      const startPos = transactionModules.find((it) => it.id === module)
        ?.position || [0, 0, 0];
      const startVec = new THREE.Vector3(...startPos);
      for (let i = 0; i < count; i++) {
        list.push({ module, startVec, t: -(i / count) * spacing });
      }
    });
    particles.current = list;
    if (meshRef.current) meshRef.current.count = 0;
  }, [transactions, spacing]);

  const endVec = useMemo(
    () => new THREE.Vector3(...transactionModules[6].position),
    []
  );

  const sphereGeometry = useMemo(
    () => new THREE.SphereGeometry(size, 8, 8),
    [size]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({ color: '#00aaff', emissive: '#005577' }),
    []
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
      meshRef.current?.setMatrixAt?.(visible++, matrix);
    });
    meshRef.current.count = visible;
    if (!meshRef.current.instanceMatrix) return;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[sphereGeometry, material, particles.current.length]}
    />
  );
};
