import React, { useEffect, useState, useRef } from 'react';
import { getBlockDataByNumber, getTransactionByHash, getSignature } from './utils/apis';

const arrowLeft = '<<';
const arrowRight = '>>';
const scaleList = [1, 10, 100, 1000, 10_000, 100_000, 1_000_000];

const CATEGORY_PATTERNS = {
  nft: [/mint/i, /position/i, /whitelist/i, /tokenId/i, /burn/i, /recovery/i],
  defi: [
    /swap/i,
    /liquidity/i,
    /stake/i,
    /reward/i,
    /pool/i,
    /quote/i,
    /donate/i,
    /hook/i,
    /query/i,
    /add|remove/i,
  ],
  transfers: [/transfer/i, /eth/i, /send/i, /claim/i],
};

const defaultStatistic = {
  nft: 0,
  defi: 0,
  transfers: 0,
  other: 0,
};

const clustering = (signatures) => {
  const statistic = { ...defaultStatistic };
  signatures.forEach((it) => {
    const lowerSig = it.text_signature.toLowerCase();
    let category = 'other';
    if (CATEGORY_PATTERNS.nft.some((pattern) => pattern.test(lowerSig))) {
      category = 'nft';
    } else if (CATEGORY_PATTERNS.defi.some((pattern) => pattern.test(lowerSig))) {
      category = 'defi';
    } else if (CATEGORY_PATTERNS.transfers.some((pattern) => pattern.test(lowerSig))) {
      category = 'transfers';
    }
    statistic[category] += 1;
  });
  return statistic;
};

const TextWithLabel = ({ label, amount }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <strong>{label}</strong>
      <div style={{ color: 'blue', paddingLeft: '4px' }}>{amount}</div>
    </div>
  );
};

export const RelayVisualizer = () => {
  const [currentBlock, setCurrentBlock] = useState(1);
  const [scale, setScale] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [txhAmountInBlock, setTxhAmountInBlock] = useState([]);
  const [txhsAmountByBlock, setTxhsAmountByBlock] = useState(0);
  const txhsClaster = useRef(defaultStatistic);

  const worksWithClusters = async (txhs) => {
    if (!Array.isArray(txhs) || txhs.length < 0) {
      throw Error('No txhs exist');
    }
    for (const txh of txhs) {
      if (!txh.input) {
        throw Error('No exist input of txh');
      }
      const methodSig = txh.input.substring(0, 10);
      if (methodSig === '0x') {
        txhsClaster.current.transfers += 1;
      } else {
        const response = await getSignature(methodSig);
        const results = Array.isArray(response?.data?.results) ? response?.data?.results : [];
        const statistics = clustering(results);
        txhsClaster.current.transfers += statistics.transfers;
        txhsClaster.current.nft += statistics.nft;
        txhsClaster.current.defi += statistics.defi;
        txhsClaster.current.other += statistics.other;
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await getBlockDataByNumber(1);
      const txhs = response?.data?.result?.transactions;
      await worksWithClusters(txhs);
      setTransactions(txhs);
    };
    fetchData();
  }, []);

  const getBlock = async (direction) => {
    txhsClaster.current = { ...defaultStatistic };
    const blockNumber = direction === 'left' ? currentBlock - scale : currentBlock + scale;
    const response = await getBlockDataByNumber(blockNumber < 0 ? 1 : blockNumber);
    const txhs = response?.data?.result?.transactions;
    await worksWithClusters(txhs);
    setTransactions(txhs);
    setCurrentBlock(blockNumber);

    if (txhs.length === 0) return;

    const realTxhsAmount =
      txhsClaster.current.defi +
      txhsClaster.current.nft +
      txhsClaster.current.transfers +
      txhsClaster.current.other;

    setTxhsAmountByBlock(realTxhsAmount);

    const viewItem = {
      allTxhsBlock: realTxhsAmount,
      ...txhsClaster.current,
    };
    const summary = [...txhAmountInBlock, viewItem];
    if (summary.length === 10) {
      setTxhAmountInBlock([]);
    } else {
      setTxhAmountInBlock(summary);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px' }}>
        <TextWithLabel label={'Current block number: '} amount={currentBlock} />
        <TextWithLabel label={'Amount of transaction in this block: '} amount={txhsAmountByBlock} />
        <div>
          <strong>Cluster types of txhs:</strong>
          {Object.keys(txhsClaster.current).map((key, index) => {
            return (
              <TextWithLabel key={index} label={`${key}: `} amount={txhsClaster.current[key]} />
            );
          })}
        </div>
        <div style={{ display: 'flex', padding: '10px 0' }}>
          <div style={{ backgroundColor: 'red', padding: '4px' }}>Defi</div>
          <div style={{ backgroundColor: 'green', padding: '4px' }}>NFT</div>
          <div style={{ backgroundColor: 'blue', padding: '4px' }}>Transfers</div>
          <div style={{ backgroundColor: 'orange', padding: '4px' }}>Other</div>
        </div>
        <div
          style={{
            display: 'flex',
            padding: '10px',
            height: '400px',
            maxHeight: '400px',
            overflowY: 'auto',
            alignItems: 'end',
          }}
        >
          {txhAmountInBlock.map((it, index) => {
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  height: `${it.allTxhsBlock}px`,
                  backgroundColor: 'grey',
                  width: '40px',
                  alignItems: 'end',
                  margin: '0 2px 0 0',
                }}
              >
                <div style={{ backgroundColor: 'red', height: `${it.defi}px`, width: '10px' }} />
                <div style={{ backgroundColor: 'green', height: `${it.nft}px`, width: '10px' }} />
                <div
                  style={{ backgroundColor: 'blue', height: `${it.transfers}px`, width: '10px' }}
                />
                <div
                  style={{ backgroundColor: 'orange', height: `${it.other}px`, width: '10px' }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={() => getBlock('left')}>{arrowLeft}</button>
        {scaleList.map((it, index) => {
          return (
            <button
              onClick={() => setScale(it)}
              style={{ backgroundColor: it === scale ? 'darkgrey' : 'lightgray' }}
              key={index}
            >
              {it}
            </button>
          );
        })}
        <button onClick={() => getBlock('right')}>{arrowRight}</button>
      </div>
    </div>
  );
};
