import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { TransactionModule } from '@/features/TransactionModule';
import { TransactionParticles } from '@/features/TransactionParticles';
import { transactionModules } from '@/shared/transactionModules';

import { useRealtimeTransactions } from './useRealtimeTransactions';

export const RealtimeTransactions = () => {
  const transactions = useRealtimeTransactions();
  const { scene } = useThree();

  useEffect(() => {
    scene.background = 'black';
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {transactionModules.map((module) => {
        return (
          <TransactionModule
            key={module.id}
            position={module.position}
            color={module.color}
            name={module.name}
          />
        );
      })}
      <TransactionParticles transactions={transactions} />

      <OrbitControls />
    </>
  );
};
