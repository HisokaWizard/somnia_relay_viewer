import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { transactionModules } from '@/shared/transactionModules';

export const TransactionParticles = ({ transactions }) => {
  const particlesRef = useRef();
  const { scene } = useThree();
  const maxParticles = 1000;
  const positions = new Float32Array(maxParticles * 3);
  const colors = new Float32Array(maxParticles * 3);
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particleMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.15,
    transparent: true,
    opacity: 0.9,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  particlesRef.current = particles;

  const activeParticles = useRef([]);

  useEffect(() => {
    activeParticles.current = [];
    const currentTime = Date.now() / 1000;

    console.log('Transactions received:', transactions);

    let totalParticles = 0;
    Object.entries(transactions).forEach(([moduleId, count]) => {
      if (moduleId === 'Somnia') return;
      const particlesToCreate = Math.min(Math.floor(count / 10), 50);
      console.log(`Module ${moduleId}: ${particlesToCreate} particles`);
      for (let i = 0; i < particlesToCreate; i++) {
        activeParticles.current.push({
          fromId: moduleId,
          startTime: currentTime + i * 0.01,
        });
        totalParticles++;
      }
    });
    console.log(`Total particles created: ${totalParticles}`);
  }, [transactions]);

  useFrame((state) => {
    const currentTime = state.clock.getElapsedTime();

    activeParticles.current = activeParticles.current.filter((p) => {
      const duration = 2;
      const progress = (currentTime - p.startTime) / duration;
      return progress < 1;
    });

    activeParticles.current = activeParticles.current.slice(-maxParticles);

    const positions = [];
    const colorsArray = [];
    activeParticles.current.forEach((p) => {
      const startPos = transactionModules.find((m) => m.id === p.fromId).position;
      const endPos = transactionModules.find((m) => m.id === 'Somnia').position;
      const duration = 2;
      const progress = (currentTime - p.startTime) / duration;
      const position = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...startPos),
        new THREE.Vector3(...endPos),
        progress,
      );
      positions.push(position.x, position.y, position.z);
      const color = transactionModules.find((m) => m.id === p.fromId).color;
      colorsArray.push((color >> 16) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255);
    });

    if (positions.length > 0) {
      particlesRef.current.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
      );
      particlesRef.current.geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colorsArray, 3),
      );
      particlesRef.current.geometry.setDrawRange(0, activeParticles.current.length);
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    } else {
      particlesRef.current.geometry.setDrawRange(0, 0); // Скрыть частицы, если их нет
    }
  });

  useEffect(() => {
    return () => {
      scene.remove(particles);
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [scene]);

  return null;
};
