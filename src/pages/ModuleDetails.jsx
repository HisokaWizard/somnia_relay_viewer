import React, { useRef, useEffect, useState } from 'react';
import { modules } from '@/shared/generalModules';
import { useParams } from 'react-router';
import { RealtimeTransactions } from '@/widgets/RealtimeTransactions';
import { MultistreamConsensusScene } from '@/widgets/MultistreamConsensus';
import { OptimisationVisualizer } from '@/widgets/OptimisationVisualizer';
import { IceDB } from '@/widgets/IceDB';
import { Canvas } from '@react-three/fiber';
import { ankrSomniaUrl } from '@/shared/apis';
import axios from 'axios';
import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider(ankrSomniaUrl));

const moduleRouterMap = {
  multistream: MultistreamConsensusScene,
  icedb: IceDB,
  evm_optimisation: () => (
    <Canvas scene={{ background: 'black' }} camera={{ position: [0, 10, 10], fov: 60 }}>
      <OptimisationVisualizer />
    </Canvas>
  ),
  partners: () => <div>Here will be partners</div>,
  transactions: RealtimeTransactions,
};

const generalContainerStyles = {
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100vh',
  position: 'relative',
};

const commonStyles = {
  width: '100%',
  height: '50px',
  backgroundColor: 'black',
  padding: '10px',
  color: 'whitesmoke',
  zIndex: 1,
};

const sceneStyles = () => ({
  position: 'absolute',
  top: '70px',
  width: '100%',
  height: `${window.document.body.clientHeight - 140}px`,
});

const headerStyles = {
  ...commonStyles,
  borderBottom: '2px solid darkgrey',
  display: 'flex',
  justifyContent: 'space-between',
  position: 'absolute',
  alignItems: 'center',
  top: 0,
};

const footerStyles = {
  ...commonStyles,
  borderTop: '2px solid darkgrey',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  bottom: 0,
};

export const ModuleDetails = () => {
  const [totalBlocks, setTotalBlocks] = useState(0);
  const { id } = useParams();
  const module = modules.find((m) => m.id === id);
  const Component = moduleRouterMap[module.id];
  const blockNumberRef = useRef(0);
  const statsRef = useRef({
    totalTransactions: 0,
    todayTransactions: 0,
  });

  useEffect(() => {
    if (module.id !== 'transactions') return;
    let breakIntervalCounter = 0;

    const runQuery = async () => {
      try {
        const lastBlock = await web3.eth.getBlockNumber();
        blockNumberRef.current = Number(lastBlock);
        const stats = await axios.get('https://somnia-poc.w3us.site/api/v2/stats');
        statsRef.current = {
          totalTransactions: Number(stats?.data?.total_transactions ?? 0),
          todayTransactions: Number(stats?.data?.transactions_today ?? 0),
        };
      } catch (error) {
        console.error(error);
      }
    };

    const poolingQuery = async () => {
      try {
        blockNumberRef.current += 50;
        const txhsUrl = `https://somnia-poc.w3us.site/api/v2/blocks/${
          blockNumberRef.current - 1000
        }/transactions`;
        const transactions = await axios.get(txhsUrl);
        statsRef.current = {
          totalTransactions:
            statsRef.current.totalTransactions + (transactions.data?.items?.length * 5 ?? 0),
          todayTransactions:
            statsRef.current.todayTransactions + (transactions.data?.items?.length * 5 ?? 0),
        };
        setTotalBlocks(blockNumberRef.current);
      } catch (error) {
        console.error(error);
        breakIntervalCounter++;
        if (breakIntervalCounter >= 20) {
          clearInterval(interval);
          console.info('Stop polling because of data source can not answer with valid response!');
        }
      }
    };

    const interval = setInterval(poolingQuery, 5000);

    runQuery();

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={generalContainerStyles}>
      <div style={headerStyles}>
        <h1>{module.name}</h1>
        <p style={{ marginRight: '20px' }}>{module.description}</p>
      </div>
      <div style={sceneStyles()}>
        {module.id === 'transactions' ? (
          <>
            <div
              style={{ zIndex: 1, position: 'absolute', top: '20px', left: '20px', color: 'green' }}
            >
              <h3>Today Blocks: {totalBlocks}</h3>
              <h3>Today Transactions: {statsRef.current.todayTransactions}</h3>
              <h3>Total Transactions: {statsRef.current.totalTransactions}</h3>
            </div>
            <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
              <Component />
            </Canvas>
          </>
        ) : (
          <Component />
        )}
      </div>
      <div style={footerStyles}>
        <a href='/'>Return to scene</a>
      </div>
    </div>
  );
};
