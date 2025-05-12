import React from 'react';
import { Text } from '@react-three/drei';

export const TransactionDashboard = ({
  transactionsPerDay,
  transactionsPerWeek,
  transactionsPerMonth,
  totalTransactions,
}) => {
  return (
    <>
      <Text position={[4, 2, 0]} fontSize={0.5} color='black'>
        Transactions per day: {transactionsPerDay}
      </Text>
      <Text position={[4, 1, 0]} fontSize={0.5} color='black'>
        Transactions per day: {transactionsPerWeek}
      </Text>
      <Text position={[4, 0, 0]} fontSize={0.5} color='black'>
        Transactions per day: {transactionsPerMonth}
      </Text>
      <Text position={[4, -1, 0]} fontSize={0.5} color='black'>
        Total transactions: {totalTransactions}
      </Text>
    </>
  );
};
