export const modules = [
  {
    id: 1,
    name: 'Consensus Mechanism',
    position: [-3.3, 3.8, 0],
    color: 'blue',
    description: 'Demonstaration of Multistream consensus.',
    modelName: 'MultistreamPipe.glb',
    model: {
      name: 'MultistreamPipe.glb',
      rotate: {
        rotateSpeed: [0, 0, 0.01],
        rotateO: [false, false, true],
      },
      scale: 0.75,
      initialRotation: [1.6, 0, 0],
    },
  },
  {
    id: 2,
    name: 'Database (IceDB)',
    position: [1, 6.5, 0],
    color: 'red',
    description: 'Visualisation of IceDB speed.',
    model: {
      name: 'IceDB.glb',
      rotate: {
        rotateSpeed: [0, 0.01, 0],
        rotateO: [false, true, false],
      },
      scale: 0.75,
      initialRotation: [0, 0, 0],
    },
  },
  {
    id: 3,
    name: 'EVM Optimization',
    position: [-1, 1, 0],
    color: 'yellow',
    description: 'Optimization EVM-bitecode.',
    model: {
      name: 'evm_optimisation.glb',
      rotate: {
        rotateSpeed: [0, 0.01, 0],
        rotateO: [false, true, false],
      },
      scale: 0.85,
      initialRotation: [0, 0, 0],
    },
  },
  {
    id: 4,
    name: 'Ecosystem Partners',
    position: [3.2, 3.7, 0],
    color: 'green',
    description: 'Somnia partners.',
    model: {
      name: 'partnerships2.glb',
      rotate: {
        rotateSpeed: [0, 0, 0.01],
        rotateO: [false, false, true],
      },
      scale: 0.75,
      initialRotation: [1.6, 0, 0],
    },
  },
  {
    id: 5,
    name: 'Transaction Visualization',
    position: [0, 3.4, 0],
    color: 'purple',
    description: 'Transactions in real time',
    model: {
      name: 'SomniaLogo2.glb',
      rotate: {
        rotateSpeed: [0, -0.005, 0],
        rotateO: [false, true, false],
      },
      scale: 0.75,
      initialRotation: [0, 0, 0],
    },
  },
];

export const lines = [
  { start: [1, 5.5, 0], end: [2.5, 3.2, 0], color: '#0057ff', width: 0.05, curvature: -1 }, // right
  { start: [-2.5, 3.3, 0], end: [1, 5.5, 0], color: '#0896d7', width: 0.05, curvature: -1 }, // top
  { start: [-2.5, 3.25, 0], end: [-1, 1.5, 0], color: '#8f08d7', width: 0.05, curvature: 0.8 }, // left
  { start: [-1, 1.5, 0], end: [2.5, 3.15, 0], color: '#d70859', width: 0.05, curvature: 1 }, // bottom
];
