import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

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
  // console.log(methodId);
  const methodMap = {
    // DeFi
    '0x095ea7b3': 'DeFi', // approve
    '0x04e45aaf': 'DeFi', // exactInputSingle
    '0x5ae401dc': 'DeFi', // multicall
    'approve': 'DeFi',
    'exactInputSingle': 'DeFi',
    'multicall': 'DeFi',
    'transfer': 'DeFi',
    'withdraw': 'DeFi',
    '0x': 'DeFi',
    'deposit': 'DeFi',
    // NFT / Metaverse
    '0x23b872dd': 'Metaverse/NFT', // transferFrom ERC-20/721
    '0x42842e0e': 'Metaverse/NFT', // safeTransferFrom
    '0xb510391f': 'Metaverse/NFT',
    'mint': 'Metaverse/NFT',
    // Infra / System
    '0x355f174c': 'Infrastructure',
    '0x08928e03': 'Infrastructure',
    '0xa71762bf': 'Infrastructure',
    '0x87c6973a': 'Infrastructure',
    '0xe43e322c': 'Infrastructure',
    // AI/Social
    'loveSomini': 'AI/Social',
  };
  if (methodMap[methodId]) {
    return methodMap[methodId];
  }

  console.log(methodId);

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

// /stats/charts/transactions - get amount of daily transactions by the last month

export const useRealtimeTransactions = () => {
  const [transactions, setTransactions] = useState(defaultStructuredTransactions);
  const [stats, setStats] = useState();
  const [statsTransactions, setStatsTransactions] = useState();

  useEffect(() => {
    const runQueries = async () => {
      try {
        const statsUrl = 'https://somnia-poc.w3us.site/api/v2/stats';
        const statsTransactionsUrl =
          'https://somnia-poc.w3us.site/api/v2/stats/charts/transactions';

        const statsResponse = await axios.get(statsUrl);
        const statsTransactionsResponse = await axios.get(statsTransactionsUrl);

        setStats(statsResponse.data);
        setStatsTransactions(statsTransactionsResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    runQueries();
    const interval = setInterval(runQueries, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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

        const transactionByBlockNumberUrl = (blockNumber) =>
          `https://somnia-poc.w3us.site/api/v2/blocks/${blockNumber}/transactions`;

        const transactionsByBlockList = [];
        for (let i = 0; i < 10; i++) {
          transactionsByBlockList.push(transactionByBlockNumberUrl(lastBlock - i));
        }

        const promises = [];
        transactionsByBlockList.forEach((url) => {
          promises.push(axios.get(url));
        });

        const responseList = await Promise.all(promises);
        let transactions = [];
        responseList.forEach((response) => {
          transactions = [...transactions, ...response.data.items];
        });

        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
          setTransactions({ ...defaultStructuredTransactions });
          return;
        }

        const structuredTransactions = { ...defaultStructuredTransactions };

        transactions.forEach((it) => {
          const type = classifyTransaction(it);
          structuredTransactions[type]++;
        });

        Object.keys(structuredTransactions).forEach((key) => {
          structuredTransactions[key] =
            structuredTransactions[key] > 100
              ? Math.round(structuredTransactions[key] / 5)
              : structuredTransactions[key];
        });

        setTransactions(structuredTransactions);
      } catch (error) {
        console.error(error);
      }
    };

    runQueries();
    const interval = setInterval(runQueries, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return useMemo(
    () => ({
      transactions,
      stats,
      statsTransactions,
    }),
    [transactions, stats, statsTransactions],
  );
};
