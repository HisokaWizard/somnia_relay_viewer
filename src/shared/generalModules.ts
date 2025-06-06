import { BooleanVector3, NumberVector3 } from './types';

export type ModuleRouteId =
  | 'multistream'
  | 'icedb'
  | 'evm_optimisation'
  | 'partners'
  | 'transactions';

export interface ModelRotate {
  rotateSpeed: NumberVector3;
  rotateO: BooleanVector3;
}

export interface Model3D {
  name: string;
  rotate: ModelRotate;
  scale: number;
  initialRotation: NumberVector3;
}

export interface MainSceneModule {
  id: ModuleRouteId;
  name: string;
  position: NumberVector3;
  color: string;
  description: string;
  model: Model3D;
}

export const modules: MainSceneModule[] = [
  {
    id: 'multistream',
    name: 'Consensus Mechanism',
    position: [-3.3, 3.8, 0],
    color: 'blue',
    description: 'Demonstaration of Multistream consensus',
    model: {
      name: 'multistream_pipe.glb',
      rotate: {
        rotateSpeed: [0, 0, 0.01],
        rotateO: [false, false, true],
      },
      scale: 0.75,
      initialRotation: [1.6, 0, 0],
    },
  },
  {
    id: 'icedb',
    name: 'Database (IceDB)',
    position: [1, 6.5, 0],
    color: 'red',
    description: 'Visualisation of IceDB speed',
    model: {
      name: 'ice_db.glb',
      rotate: {
        rotateSpeed: [0, 0.01, 0],
        rotateO: [false, true, false],
      },
      scale: 0.75,
      initialRotation: [0, 0, 0],
    },
  },
  {
    id: 'evm_optimisation',
    name: 'EVM Optimization',
    position: [-1, 1, 0],
    color: 'yellow',
    description: 'Optimization EVM-bitecode',
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
    id: 'partners',
    name: 'Ecosystem Partners',
    position: [3.2, 3.7, 0],
    color: 'green',
    description: 'Somnia ecosystem partners',
    model: {
      name: 'partnerships_bros.glb',
      rotate: {
        rotateSpeed: [0, 0, 0.01],
        rotateO: [false, false, true],
      },
      scale: 0.75,
      initialRotation: [1.6, 0, 0],
    },
  },
  {
    id: 'transactions',
    name: 'Transaction Visualization',
    position: [0, 3.4, 0],
    color: 'purple',
    description: 'Transactions in real time',
    model: {
      name: 'somnia_logo.glb',
      rotate: {
        rotateSpeed: [0, -0.005, 0],
        rotateO: [false, true, false],
      },
      scale: 0.75,
      initialRotation: [0, 0, 0],
    },
  },
];
