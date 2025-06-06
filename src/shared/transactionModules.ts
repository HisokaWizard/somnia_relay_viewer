import { NumberVector3 } from './types';

export type Clasters =
  | 'DeFi'
  | 'Gaming'
  | 'AI/Social'
  | 'Metaverse/NFT'
  | 'Infrastructure'
  | 'Other';

export interface TransactionModule {
  id: Clasters | 'Somnia';
  name: Clasters | 'Somnia';
  position: NumberVector3;
  color: string;
}

export type TransactionClasters = Record<Clasters, number>;

export const transactionModules: TransactionModule[] = [
  {
    id: 'DeFi',
    name: 'DeFi',
    position: [3, 1, 0],
    color: '0xff0000',
  },
  {
    id: 'Gaming',
    name: 'Gaming',
    position: [1.5, 1, 2.598],
    color: '0x00ff00',
  },
  {
    id: 'AI/Social',
    name: 'AI/Social',
    position: [-1.5, 1, 2.598],
    color: '0xff00ff',
  },
  {
    id: 'Metaverse/NFT',
    name: 'Metaverse/NFT',
    position: [-3, 1, 0],
    color: '0xffff00',
  },
  {
    id: 'Infrastructure',
    name: 'Infrastructure',
    position: [1.5, 1, -2.598],
    color: '0x0000ff',
  },
  {
    id: 'Other',
    name: 'Other',
    position: [-1.5, 1, -2.598],
    color: '0xffa500',
  },
  {
    id: 'Somnia',
    name: 'Somnia',
    position: [0, 2, 0],
    color: 'silver',
  },
];
