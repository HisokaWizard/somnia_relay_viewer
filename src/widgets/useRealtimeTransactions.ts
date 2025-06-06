import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';
import { ankrSomniaUrl } from '@/shared/apis';
import { Clasters, MinimalTransactionDto } from '@/shared';

const web3 = new Web3(new Web3.providers.HttpProvider(ankrSomniaUrl));

const classifyTransaction = (tx: MinimalTransactionDto) => {
  // Infrastructure
  if (tx.created_contract) return 'Infrastructure';

  const methodId = tx.method || tx.raw_input.slice(0, 10);

  // console.log('Method ID: ', methodId, '\t', 'tx.transaction_types: ', tx.transaction_types);

  const methodMap: Record<string, Clasters> = {
    // DeFi
    '0x095ea7b3': 'DeFi', // approve
    '0x04e45aaf': 'DeFi', // exactInputSingle
    '0x5ae401dc': 'DeFi', // multicall
    approve: 'DeFi',
    exactInputSingle: 'DeFi',
    multicall: 'DeFi',
    transfer: 'DeFi',
    withdraw: 'DeFi',
    deposit: 'DeFi',
    swapExactTokensForTokens: 'DeFi',
    swapExactETHForTokens: 'DeFi',
    swapExactTokensForETH: 'DeFi',
    limitBuy: 'DeFi',
    addLiquidityETH: 'DeFi',
    // NFT / Metaverse
    '0x23b872dd': 'Metaverse/NFT', // transferFrom ERC-20/721
    '0x42842e0e': 'Metaverse/NFT', // safeTransferFrom
    '0xb510391f': 'Metaverse/NFT',
    mint: 'Metaverse/NFT',
    transferFrom: 'Metaverse/NFT',
    safeTransferFrom: 'Metaverse/NFT',
    // Infra / System
    '0x355f174c': 'Infrastructure',
    '0x08928e03': 'Infrastructure',
    '0xa71762bf': 'Infrastructure',
    '0x87c6973a': 'Infrastructure',
    '0xe43e322c': 'Infrastructure',
    '0x17aa2f7c': 'Infrastructure',
    '0xb3446f85': 'Infrastructure',
    '0x00000000': 'Infrastructure',
    '0x704f1b94': 'Infrastructure',
    sendToken: 'Infrastructure',
    '0x3eaf5d9f': 'Infrastructure',
    '0x3593564c': 'Infrastructure',
    '0xb03f4528': 'Infrastructure',
    '0x80114347': 'Infrastructure',
    '0x8467be0d': 'Infrastructure',
    createToken: 'Infrastructure',
    '0x': 'Infrastructure',
    // AI/Social
    loveSomini: 'AI/Social',
    colorPixel: 'AI/Social',
    onChainGM: 'AI/Social',
    '0xdbaa1e64': 'AI/Social',
    '0x10fe7c48': 'AI/Social',
    // Gaming
    flipCoin: 'Gaming',
    updateScore: 'Gaming',
    addFun: 'Gaming',
    '0x4697fd9c': 'Gaming',
    '0x894f43c0': 'Gaming',
    '0x6e31c749': 'Gaming',
    payRewards: 'Gaming',
    '0xc827c0ff': 'Gaming',
    claim: 'Gaming',
  };
  if (methodMap?.[methodId]) {
    return methodMap[methodId];
  }

  console.log(
    'Method ID: ',
    methodId,
    '\t',
    'tx.transaction_types: ',
    tx.transaction_types
  );

  // 7. Default
  return 'Other';
};

const defaultStructuredTransactions = {
  Infrastructure: 0,
  DeFi: 0,
  'Metaverse/NFT': 0,
  Gaming: 0,
  'AI/Social': 0,
  Other: 0,
};

// /stats/charts/transactions - get amount of daily transactions by the last month

export const useRealtimeTransactions = () => {
  const [transactions, setTransactions] = useState(
    defaultStructuredTransactions
  );

  useEffect(() => {
    let breakIntervalCounter = 0;
    const runQueries = async () => {
      try {
        const lastBlock = await web3.eth.getBlockNumber();
        const lastBlockNumber = Number(lastBlock);

        if (!lastBlockNumber) {
          setTransactions({ ...defaultStructuredTransactions });
          return;
        }

        const transactionByBlockNumberUrl = (blockNumber: number) =>
          `https://somnia-poc.w3us.site/api/v2/blocks/${blockNumber}/transactions`;

        const transactionsByBlockList = [];
        for (let i = 0; i < 10; i++) {
          transactionsByBlockList.push(
            transactionByBlockNumberUrl(lastBlockNumber - 1000 - i)
          );
        }

        const promises: Promise<axios.AxiosResponse<any, any>>[] = [];
        transactionsByBlockList.forEach((url) => {
          promises.push(axios.get(url));
        });

        const responseList = await Promise.allSettled(promises);
        let transactions: MinimalTransactionDto[] = [];

        responseList.forEach((response) => {
          if (response.status === 'fulfilled') {
            transactions = [...transactions, ...response.value.data.items];
          } else if (response.status === 'rejected') {
            breakIntervalCounter++;
            if (breakIntervalCounter >= 100) {
              clearInterval(interval);
              console.info(
                'Stop polling because of data source can not answer with valid response!'
              );
            }
          }
        });

        if (
          !transactions ||
          !Array.isArray(transactions) ||
          transactions.length === 0
        ) {
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

    runQueries();
    setTransactions({
      ...defaultStructuredTransactions,
      Infrastructure: 50,
      DeFi: 30,
      Gaming: 15,
      'Metaverse/NFT': 15,
    });

    const interval = setInterval(runQueries, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return useMemo(
    () => ({
      transactions,
    }),
    [transactions]
  );
};
