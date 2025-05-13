import React, { useRef } from 'react';
import { Html } from '@react-three/drei';

export const TransactionModule = ({ position, color, name }) => {
  const meshRef = useRef();

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[name === 'Somnia' ? 1 : 0.5, 0]} />
      <meshStandardMaterial color={color} />

      <Html position={[0, 1, 0]}>
        <h3 style={{ color: 'lightgreen' }}>{name}</h3>
      </Html>
    </mesh>
  );
};
