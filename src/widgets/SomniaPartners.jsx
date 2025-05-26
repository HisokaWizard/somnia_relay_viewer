import React, { useState, useRef, useEffect, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

// Данные графа (пример, замените на реальные данные партнеров Somnia)
const initialGraphData = {
  nodes: [
    {
      id: 'Somnia',
      name: 'Somnia',
      description:
        'Somnia is the fastest EVM-compatible layer one blockchain for a fully onchain world',
      logo: `${import.meta.env.BASE_URL}textures/somnia_logo.png`,
    },
    {
      id: 'Ankr RPC',
      name: 'Ankr RPC',
      description:
        'A provider of RPC nodes and subgraphs for blockchains. Supplies infrastructure for developers within the Somnia ecosystem.',
      logo: `${import.meta.env.BASE_URL}textures/ankr_logo.png`,
    },
    {
      id: 'Privy.io',
      name: 'Privy.io',
      description:
        'A platform enabling seamless wallet integration into Web3 applications, offering smooth onboarding and wallet management.',
      logo: `${import.meta.env.BASE_URL}textures/privy_logo.gif`,
    },
  ],
  links: [
    { source: 'Somnia', target: 'Ankr RPC', color: 'blue' },
    { source: 'Somnia', target: 'Privy.io', color: 'violet' },
  ],
};

export const SomniaPartners = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [textures, setTextures] = useState({});
  const nodeObjects = useRef(new Map());

  useEffect(() => {
    const loadTextures = async () => {
      const textureMap = {};
      for (const node of initialGraphData.nodes) {
        try {
          const texture = await new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(node.logo, resolve, undefined, reject);
          });
          textureMap[node.id] = texture;
        } catch (error) {
          console.error(`Failed to load texture for ${node.id}:`, error);
        }
      }
      setTextures(textureMap);
    };
    loadTextures();
  }, []);

  const handleNodeHover = useCallback(
    (node) => {
      if (hoveredNode && hoveredNode.id !== node?.id) {
        const prevObj = nodeObjects.current.get(hoveredNode.id);
        if (prevObj) {
          prevObj.scale.set(1, 1, 1);
        }
      }

      if (node) {
        const obj = nodeObjects.current.get(node.id);
        if (obj) {
          obj.scale.set(1.4, 1.4, 1);
        }
      }

      setHoveredNode(node || null);
    },
    [setHoveredNode, hoveredNode],
  );

  const linkPositionUpdate = useCallback((cylinder, { start, end }, link) => {
    const sourceNodeObj = nodeObjects.current.get(link.source.id);
    const targetNodeObj = nodeObjects.current.get(link.target.id);

    const sourceRadius = 5 * sourceNodeObj.scale.x;
    const targetRadius = 5 * targetNodeObj.scale.x;

    const startVec = new THREE.Vector3(start.x, start.y, start.z);
    const endVec = new THREE.Vector3(end.x, end.y, end.z);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const dirNormalized = direction.clone().normalize();

    const adjustedStart = startVec.clone().add(dirNormalized.clone().multiplyScalar(sourceRadius));
    const adjustedEnd = endVec.clone().sub(dirNormalized.clone().multiplyScalar(targetRadius));

    const newLength = adjustedStart.distanceTo(adjustedEnd);
    const midpoint = new THREE.Vector3().addVectors(adjustedStart, adjustedEnd).multiplyScalar(0.5);

    cylinder.position.copy(midpoint);
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNormalized);
    cylinder.scale.set(1, newLength, 1);

    return true;
  }, []);

  const nodeThreeObject = useCallback(
    (node) => {
      const geometry = new THREE.CircleGeometry(5, 32);
      let material;

      if (textures[node.id]) {
        material = new THREE.MeshBasicMaterial({
          map: textures[node.id],
          side: THREE.DoubleSide,
        });
      } else {
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      }

      const circle = new THREE.Mesh(geometry, material);
      nodeObjects.current.set(node.id, circle);
      return circle;
    },
    [textures],
  );

  const linkThreeObject = useCallback((link) => {
    const geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(link.color) });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.renderOrder = 0;
    return cylinder;
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 3D Граф */}
      <ForceGraph3D
        graphData={initialGraphData}
        onNodeHover={handleNodeHover}
        nodeThreeObject={nodeThreeObject}
        linkThreeObject={linkThreeObject}
        linkPositionUpdate={linkPositionUpdate}
        enableNodeDrag
        enableZoomInteraction
        enablePanInteraction
        backgroundColor='#1a1a1a'
      />

      {/* Панель с информацией о компании */}
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            maxWidth: '300px',
            zIndex: 1000,
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>{hoveredNode.name}</h3>
          <p style={{ margin: 0, fontSize: '0.9em' }}>{hoveredNode.description}</p>
        </div>
      )}
    </div>
  );
};
