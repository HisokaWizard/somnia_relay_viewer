import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

type LogEntry = { time: string; msg: string };

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CHAIN_ID_HEX = '0xC488';
const SOMNIA_PARAMS = {
  chainId: CHAIN_ID_HEX,
  chainName: 'Somnia Testnet',
  nativeCurrency: { name: 'Test ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: [
    'https://testnet-rpc.somnia.network/',
    'https://dream-rpc.somnia.network/',
  ],
  blockExplorerUrls: ['https://testnet.somniascan.io/'],
};

export const getContractBalance = async (contractAddress: string) => {
  const provider = new ethers.providers.JsonRpcProvider(
    SOMNIA_PARAMS.rpcUrls[1]
  );
  const balance = await provider.getBalance(contractAddress);
  return ethers.utils.formatEther(balance);
};

export const useWeb3State = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [account, setAccount] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const log = useCallback((m: string) => {
    setLogs((prev) => [
      { time: new Date().toLocaleTimeString(), msg: m },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(p);
      log('MetaMask detected. Please connect your wallet.');
    } else {
      log('MetaMask not detected. Please install the extension to play.');
    }
  }, [log]);

  const ensureCorrectChain = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_HEX }],
      });
      log('✅ Switched to Somnia Testnet');
    } catch (err: any) {
      if (err.code === 4902) {
        log('🛠️ Somnia network not found, adding it...');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SOMNIA_PARAMS],
        });
      } else {
        log(`❗ Failed to switch: ${err.message}`);
        throw err;
      }
    }
  }, [log]);

  const connect = useCallback(
    async (contractAddress: string, abi: any) => {
      if (!provider) {
        log('Provider not found.');
        return;
      }
      try {
        await ensureCorrectChain();
        const [addr] = await provider.send('eth_requestAccounts', []);
        const sig = provider.getSigner();
        const c = new ethers.Contract(contractAddress, abi, sig);

        setAccount(addr);
        setSigner(sig);
        setContract(c);

        log(`✅ Wallet connected: ${addr}`);

        const ownerAddress = await c.owner();
        if (addr.toLowerCase() === ownerAddress.toLowerCase()) {
          setIsOwner(true);
          log('👑 You are connected as the contract owner.');
        }
      } catch (error: any) {
        log(`❗ Connection error: ${error.message}`);
      }
    },
    [log, provider, ensureCorrectChain]
  );

  return {
    log,
    connect,
    provider,
    signer,
    contract,
    account,
    isOwner,
    logs,
  };
};
