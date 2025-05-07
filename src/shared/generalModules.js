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
      name: 'EvmOptimisation.glb',
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
      name: 'Partnerships.glb',
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
      name: 'SomniaLogo.glb',
      rotate: {
        rotateSpeed: [0, -0.005, 0],
        rotateO: [false, true, false],
      },
      scale: 0.75,
      initialRotation: [0, 0, 0],
    },
  },
];
