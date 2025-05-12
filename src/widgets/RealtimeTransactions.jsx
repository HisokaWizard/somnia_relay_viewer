import React, { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { TransactionModule } from '@/features/TransactionModule';
import { TransactionParticles } from '@/features/TransactionParticles';
import { TransactionDashboard } from '@/features/TransactionDashboard';
import { transactionModules } from '@/shared/transactionModules';

import { useRealtimeTransactions } from './useRealtimeTransactions';

export const RealtimeTransactions = () => {
  const { transactions, stats, statsTransactions } = useRealtimeTransactions();
  const { scene } = useThree();

  const { transactionsPerWeek, transactionsPerMonth, transactionsPerDay, totalTransactions } =
    useMemo(() => {
      let week = 0;
      let month = 0;
      const transactionsPerDay = String(stats?.transactions_today ?? 0);
      const totalTransactions = String(stats?.total_transactions ?? 0);
      statsTransactions?.chart_data?.forEach((it, index) => {
        if (index < 6) {
          week += it.transaction_count;
        }
        month += it.transaction_count;
      });
      return {
        transactionsPerDay,
        totalTransactions,
        transactionsPerWeek: String(week),
        transactionsPerMonth: String(month),
      };
    }, [statsTransactions]);

  useEffect(() => {
    scene.background = 'whitesmoke';
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
      <TransactionDashboard
        transactionsPerDay={transactionsPerDay}
        transactionsPerWeek={transactionsPerWeek}
        transactionsPerMonth={transactionsPerMonth}
        totalTransactions={totalTransactions}
      />

      <OrbitControls />
    </>
  );
};
