import React, { useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import QuizSessionABI from '../../artifacts/contracts/QuizSession.sol/QuizSession.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SOMNIA_PARAMS = {
  chainId: '0xC488', // 50312 в шестнадц.
  chainName: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Token', symbol: 'STT', decimals: 18 },
  rpcUrls: ['https://rpc.ankr.com/somnia_testnet/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
};
const CHAIN_ID = 50312;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? '';

type LogEntry = { time: string; msg: string };

export const Quiz = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [account, setAccount] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  const log = (m: string) =>
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), msg: m },
    ]);

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(p);
      ensureCorrectChain();
    } else log('MetaMask не обнаружен.');
  }, []);

  const ensureCorrectChain = async () => {
    try {
      await window.ethereum.request!({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID }],
      });
      log('✅ Сеть переключена на Somnia Testnet');
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request!({
          method: 'wallet_addEthereumChain',
          params: [SOMNIA_PARAMS],
        });
        log('🛠 Somnia Testnet добавлена в MetaMask');
      } else {
        log('❗ Не удалось переключиться: ' + err.message);
      }
    }
  };

  const connect = async () => {
    try {
      if (!provider) return;
      await ensureCorrectChain();
      const [addr] = await provider.send('eth_requestAccounts', []);
      setAccount(addr);
      const sig = provider.getSigner();
      setSigner(sig);
      const c = new ethers.Contract(CONTRACT_ADDRESS, QuizSessionABI.abi, sig);
      setContract(c);
      log(`Подключен: ${addr}`);
      setupListeners(c);
    } catch (error) {
      console.error(error);
    }
  };

  const setupListeners = (c: ethers.Contract) => {
    c.on('SessionStarted', (...args) => {
      log(
        `Сессия старт: ${args[0]}, fee=${ethers.utils.formatEther(args[3])} STT`
      );
    });
    c.on('AnswerSubmitted', (user, idx) => log(`Ответ от ${user}: ${idx}`));
    c.on('SessionEnded', (winners, share) =>
      log(
        `Финиш! Победители: ${winners.join(', ')}, share=${ethers.utils.formatEther(share)} STT`
      )
    );
  };

  const startSession = async () => {
    try {
      if (!contract) return;
      const question = 'Who killed Smeagol?';
      const opts = ['Fish', 'Ring', 'Gollum', 'Age'];
      const corr = 1;
      const feeStr = '0.001';
      const fee = ethers.utils.parseEther(feeStr);
      const isActive = await contract.active();
      const owner = await contract.owner();
      const balance = ethers.utils.formatEther(
        provider ? await provider.getBalance(account) : '0'
      );
      console.log('Session active:', isActive, owner, balance);
      setQuestion(question);
      setOptions(opts);
      const tx = await contract.startSession(question, opts, corr, fee, {
        gasLimit: 3_000_000, // вручную
      });
      log('Начало сессии...');
      setIsSessionActive(true);
      await tx.wait();
      log('✅ Сессия начата');
    } catch (error) {
      console.error(error);
    }
  };

  const submitAnswer = async (idx: number) => {
    try {
      if (!contract) return;
      const fee: ethers.BigNumber = await contract.fee();
      const tx = await contract.submitAnswer(idx, {
        value: fee,
        gasLimit: 1_000_000,
      });
      log(`Отправка ответа ${idx}...`);
      await tx.wait();
      log('✅ Ответ отправлен');
    } catch (error) {
      console.error(error);
    }
  };

  const endSession = async () => {
    try {
      if (!contract) return;
      const tx = await contract.endSession({ gasLimit: 300_000 });
      log('Завершаем сессию...');
      setQuestion('');
      setOptions([]);
      setIsSessionActive(false);
      await tx.wait();
      log('✅ Сессия завершена');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Somnia Quiz (Testnet, STT)</h1>
      {!account ? (
        <button onClick={connect}>Подключиться к MetaMask</button>
      ) : (
        <>
          <p>👤 {account}</p>
          <button onClick={startSession}>Запустить сессию</button>
          <button onClick={endSession}>Завершить</button>
          <div>
            {logs.map((l, i) => (
              <div key={i}>
                <small>[{l.time}]</small> {l.msg}
              </div>
            ))}
          </div>
          {isSessionActive && question ? (
            <div>
              <h2>{question}</h2>
              <ul>
                {options.map((opt, idx) => (
                  <li key={idx}>
                    <button onClick={() => submitAnswer(idx)}>{opt}</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Нет активной сессии</p>
          )}
        </>
      )}
    </div>
  );
};
