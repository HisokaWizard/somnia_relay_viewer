import axios from 'axios';
import { useEffect, useState } from 'react';

const protocolMap = {
  gaming: ['0x4697Fd9Ca2DdaFcd3034219d850bc02Ec82E5448'],
  ai: ['0x0F212bAa0a2cFB6c1fe3A3931deC0F35Ba604420', '0x23d6C2f57C65065d0f3b9c5b7773E4f79eDDB18B'],
};

const classifyTransaction = (tx) => {
  // Infrastructure
  if (tx.transaction_types.includes('coin_transfer') && tx.transaction_types.length === 1)
    return 'Infrastructure';
  if (tx.created_contract) return 'Infrastructure';
  const gas = Number(tx.gas_used);
  if (gas > 200_000) return 'Infrastructure';
  if (gas === 21000 && tx.value !== '0') return 'Infrastructure';

  // 6. Дефолт: contract_call vs unknown
  // if (tx.transaction_types.includes('contract_call')) {
  //   return 'Infrastructure';
  // }

  // Defi
  const defiMethods = ['exactInputSingle', 'swapExactTokensForTokens'];
  if (tx.decoded_input?.method_call?.includes(defiMethods)) return 'DeFi';
  if (Array.isArray(tx.token_transfers) && tx.token_transfers.length > 0) {
    return 'DeFi';
  }

  // 3. NFT/Metaverse
  const nftMethods = ['transferFrom', 'safeTransferFrom', 'mint'];
  if (tx.decoded_input?.method_call?.includes(nftMethods)) return 'Metaverse/NFT';

  // 4. Gaming
  if (protocolMap.gaming.includes(tx.to.hash.toLowerCase())) return 'Gaming';

  // 5. AI/Social
  if (protocolMap.ai.includes(tx.to.hash.toLowerCase())) return 'AI/Social';

  const methodId = tx.method || tx.raw_input.slice(0, 10);
  const methodMap = {
    // DeFi
    '0x095ea7b3': 'DeFi', // approve
    '0x04e45aaf': 'DeFi', // exactInputSingle
    '0x5ae401dc': 'DeFi', // multicall
    // NFT / Metaverse
    '0x23b872dd': 'Metaverse', // transferFrom ERC-20/721
    '0x42842e0e': 'Metaverse', // safeTransferFrom
    // Infra / System
    '0x355f174c': 'Infrastructure', // ваш специфичный метод
  };
  if (methodMap[methodId]) {
    return methodMap[methodId];
  }

  // 7. Default
  return 'Other';
};

const defaultStructuredTransactions = {
  'Infrastructure': 0,
  'DeFi': 0,
  'Metaverse/NFT': 0,
  'Gaming': 0,
  'AI/Social': 0,
  'Other': 0,
};

export const useRealtimeTransactions = () => {
  const [transactions, setTransactions] = useState(defaultStructuredTransactions);

  useEffect(() => {
    const runQueries = async () => {
      try {
        const statsUrl = 'https://somnia-poc.w3us.site/api/v2/stats';
        const statsResponse = await axios.get(statsUrl);
        const lastBlock = statsResponse.data?.total_blocks;

        if (!lastBlock) {
          setTransactions({ ...defaultStructuredTransactions });
          return;
        }

        const transactionByBlockNumberUrl = `https://somnia-poc.w3us.site/api/v2/blocks/${lastBlock}/transactions`;
        const transactionsResponse = await axios.get(transactionByBlockNumberUrl);
        const transactions = transactionsResponse.data.items;

        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
          setTransactions({ ...defaultStructuredTransactions });
          return;
        }

        const structuredTransactions = { ...defaultStructuredTransactions };

        transactions.forEach((it) => {
          const type = classifyTransaction(it);
          structuredTransactions[type]++;
        });

        setTransactions(structuredTransactions);
      } catch (error) {
        console.error(error);
      }
    };

    const interval = setInterval(runQueries, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return transactions;
};
