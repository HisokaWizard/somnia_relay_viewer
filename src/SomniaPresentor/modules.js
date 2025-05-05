export const modules = [
  {
    id: 1,
    name: 'Consensus Mechanism',
    position: [-2.5, 2, 0], // x y z
    color: 'blue',
    description: 'Demonstaration of Multistream consensus.',
  },
  {
    id: 2,
    name: 'Database (IceDB)',
    position: [1, 3.5, 0],
    color: 'red',
    description: 'Visualisation of IceDB speed.',
  },
  {
    id: 3,
    name: 'EVM Optimization',
    position: [-1, 0.5, 0],
    color: 'yellow',
    description: 'Optimization EVM-bitecode.',
  },
  {
    id: 4,
    name: 'Ecosystem Partners',
    position: [2.5, 2, 0],
    color: 'green',
    description: 'Somnia partners.',
  },
  {
    id: 5,
    name: 'Transaction Visualization',
    position: [0, 2, 0],
    color: 'purple',
    description: 'Transactions in real time',
  },
];

export const lines = [
  { start: [1, 3.5, 0], end: [2.5, 2, 0], color: '#0057ff', width: 0.1, curvature: -1 }, // right
  { start: [-2.5, 2.2, 0], end: [1, 3.9, 0], color: '#0896d7', width: 0.1, curvature: -1 }, // top
  { start: [-2.5, 2, 0], end: [-1, 0.5, 0], color: '#8f08d7', width: 0.1, curvature: 1 }, // left
  { start: [-1, 0.2, 0], end: [2.5, 1.7, 0], color: '#d70859', width: 0.1, curvature: 1 }, // bottom
];
