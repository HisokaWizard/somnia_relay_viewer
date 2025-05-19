import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useState, useEffect, useMemo, useCallback } from 'react';

const validatorsAmount = 16;
const blocksAmount = 20;
const matrixRow = 4;
const matrixCol = 4;
const blockSpacing = 1;
const rowSpacing = 2;
const colSpacing = 2;
const consensusInterval = 5;
const totalY = (matrixRow - 1) * rowSpacing;
const totalZ = (matrixCol - 1) * colSpacing;
const consensusOffset = 2;

export const MultistreamConsensusScene = () => {
  const [blocksViewerAmount, setBlocksViewerAmount] = useState(0);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [hoveredPlane, setHoveredPlane] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocksViewerAmount((prev) => (prev < blocksAmount - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const repeatInteractive = useCallback(() => {
    setHoveredBlock(null);
    setHoveredPlane(null);
    setBlocksViewerAmount(0);
  }, []);

  const currentBlocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < validatorsAmount; i++) {
      const row = Math.floor(i / matrixCol);
      const col = i % matrixCol;
      const color = new THREE.Color(`hsl(${(i / validatorsAmount) * 360}, 100%, 50%)`);
      for (let j = 0; j <= blocksViewerAmount; j++) {
        const x = j * blockSpacing;
        const y = row * rowSpacing;
        const z = col * colSpacing;
        blocks.push(
          <mesh
            key={`${i}-${j}`}
            position={[x, y, z]}
            onPointerOver={() => setHoveredBlock({ i, j })}
            onPointerOut={() => setHoveredBlock(null)}
          >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={color} />
          </mesh>,
        );
      }
    }

    return blocks;
  }, [blocksViewerAmount, setHoveredBlock]);

  const currentConsensusPlanes = useMemo(() => {
    const numConsensus = Math.floor((blocksAmount - consensusOffset) / consensusInterval) + 1;
    const consensusPlanes = [];

    for (let i = 0; i < numConsensus; i++) {
      if (i * consensusInterval <= blocksViewerAmount) {
        const consensusBlock = consensusOffset + i * consensusInterval;
        if (blocksViewerAmount >= consensusBlock) {
          const x = consensusBlock * blockSpacing;
          consensusPlanes.push(
            <mesh
              key={`consensus-${i}`}
              position={[x, totalY / 2, totalZ / 2]}
              rotation={[0, Math.PI / 2, 0]}
              onPointerOver={() => setHoveredPlane(i)}
              onPointerOut={() => setHoveredPlane(null)}
            >
              <planeGeometry args={[totalZ, totalY]} />
              <meshStandardMaterial
                transparent
                opacity={0.7}
                color='blue'
                side={THREE.DoubleSide}
              />
            </mesh>,
          );
        }
      }
    }

    return consensusPlanes;
  }, [blocksViewerAmount, setHoveredPlane]);

  const description = useMemo(
    () => (
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          maxWidth: '300px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <strong>Animation:</strong> Blocks appear gradually every 2 seconds, reflecting the addition
        of new blocks to the data chain.
        <br />
        <strong>Interactive:</strong> Rotate the scene with your mouse (OrbitControls). Hover over
        consensus blocks or planes to see information.
      </div>
    ),
    [],
  );

  const descriptionBlocks = useMemo(() => {
    return hoveredBlock ? (
      <Html
        position={[
          hoveredBlock.j * blockSpacing,
          Math.floor(hoveredBlock.i / matrixCol) * rowSpacing + 0.7,
          (hoveredBlock.i % matrixCol) * colSpacing,
        ]}
        transform
        style={{ pointerEvents: 'none' }}
      >
        <div style={{ backgroundColor: 'white', padding: '4px', borderRadius: '4px' }}>
          Validator {hoveredBlock.i}, Block {hoveredBlock.j}
        </div>
      </Html>
    ) : null;
  }, [hoveredBlock]);

  const descriptionPlanes = useMemo(() => {
    return hoveredPlane ? (
      <Html
        position={[
          consensusOffset + hoveredPlane * consensusInterval * blockSpacing,
          totalY / 2 + totalY / 2 + 0.5,
          totalZ / 2,
        ]}
        transform={false}
        sprite
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '4px',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          Consensus Plane {hoveredPlane}: Synchronizes all data chains at block{' '}
          {consensusOffset + hoveredPlane * consensusInterval}
        </div>
      </Html>
    ) : null;
  }, [hoveredPlane]);

  const interavtiveButton = useMemo(
    () => (
      <button
        style={{
          position: 'absolute',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10,
          fontSize: '14px',
          left: '15px',
          top: '125px',
          padding: '5px',
        }}
        onClick={repeatInteractive}
      >
        Repeat interactive
      </button>
    ),
    [repeatInteractive],
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {description}
      {interavtiveButton}
      <Canvas scene={{ background: 'black' }} camera={{ position: [-15, 7, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        {currentBlocks}
        {currentConsensusPlanes}
        {descriptionBlocks}
        {descriptionPlanes}
        <OrbitControls />
      </Canvas>
    </div>
  );
};
