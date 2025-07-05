import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import GameLifecycleABI from '../../artifacts/contracts/GameLifecycle.sol/GameLifecycle.json';
import { requestToOpenRouter } from '@/shared';

// Стили для компонента
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

  .quiz-container {
    font-family: 'MedievalSharp', cursive;
    background-image: url('/textures/lotr-bg.jpg');
    background-size: cover;
    background-position: center;
    min-height: calc(100vh - 220px);
    color: #EAEAEA;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    position: relative;
  }
  .quiz-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7); /* Затемняющий слой */
    z-index: 1;
  }
  .main-content {
    display: flex;
    gap: 20px;
    width: 100%;
    max-width: 1200px;
    z-index: 2;
  }
  .game-panel {
    flex: 3;
    background: rgba(10, 20, 30, 0.85);
    border: 2px solid #4a4a4a;
    border-radius: 10px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  }
  .log-panel {
    flex: 2;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #333;
    border-radius: 5px;
    padding: 20px;
    height: calc(100vh - 220px);
    overflow-y: auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }
  .log-entry {
    margin-bottom: 5px;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 5px;
  }
  .log-time {
    color: #888;
    margin-right: 10px;
  }
  button {
    font-family: 'MedievalSharp', cursive;
    background-color: #3d3d3d;
    color: #ffc107;
    border: 2px solid #ffc107;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2em;
    margin: 10px;
    transition: all 0.3s ease;
  }
  button:hover {
    background-color: #ffc107;
    color: #1a1a1a;
  }
  button:disabled {
    background-color: #222;
    color: #555;
    border-color: #555;
    cursor: not-allowed;
  }
  .loader {
    border: 8px solid #f3f3f340;
    border-top: 8px solid #ffc107;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .timer {
    font-size: 2em;
    color: #ffc107;
    margin: 20px 0;
  }
  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 20px;
  }
`;

declare global {
  interface Window {
    ethereum?: any;
  }
}

const getPrompt = (questionRange: number, previousQuestions: string[]) => `
        Ты непревзойденный знаток Толкиена, и тебе предстоит задача, придумать вопрос по вселенной Lord of the Rings, основываясь на книжных произведениях, по всем книгам данной вселенной. Уровень сложности вопроса определяется от 0 до 100, где 0 это простейший вопрос, который знает каждый, например: Кто такой Фродо? и варианты ответа: (Гном, эльф, человек, хоббит), а 100 это невероятно сложный вопрос, требующий задуматься и хорошенько покопаться в памяти, например: Какой из Валар, участвовавших в Музыке Айнур, был ответственен за формирование физической структуры Арды, включая горы и моря? и варинты ответа: (Манвэ, Ульмо, Аулэ, Ирмо)
        Текущий уровень сложности равен ${questionRange}.

        Вопрос обязан быть ОДИН!

        Ответ нужно ОБЯЗАТЕЛЬНО вернуть в виде JSON объекта следующей структуры:
        {
          question: 'Как умер Боромир?',
          options: ['Упал в пропасть', 'Сгорел в огне Роковой горы', 'Пал в битве с предводителем орков', 'Пал в битве при Минас-Тирите от рук Короля-колдуна'],
          correctAnswer: 'Пал в битве с предводителем орков',
        }
        Нельзя возвращать ничего кроме валидного JSON объекта!!!
        Также, вот список вопросов, которые уже были заданы, их повторно задавать не нужно:
        ${previousQuestions.join('\n')}
      `;

const CHAIN_ID_HEX = '0xC488';
const SOMNIA_PARAMS = {
  chainId: CHAIN_ID_HEX, // 50312 в шестнадц.
  chainName: 'Somnia Testnet',
  nativeCurrency: { name: 'Test ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.somnia.network/'],
  blockExplorerUrls: ['https://testnet.somniascan.io/'],
};

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';
const getStakeAmount = (questionRange: number) =>
  String(questionRange / 100).slice(0, 3);

type LogEntry = { time: string; msg: string };
type GameData = {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
  gameId: string;
  dataHash: string;
};

export const Quiz = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [account, setAccount] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [timer, setTimer] = useState<number>(0);

  const log = useCallback((m: string) => {
    setLogs((prev) => [
      { time: new Date().toLocaleTimeString(), msg: m },
      ...prev,
    ]);
  }, []);

  // --- Web3 и Подключение к контракту ---

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(p);
      log('MetaMask обнаружен. Пожалуйста, подключитесь.');
    } else {
      log('MetaMask не обнаружен. Установите расширение для игры.');
    }
  }, [log]);

  const ensureCorrectChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_HEX }],
      });
      log('✅ Сеть переключена на Somnia Testnet');
    } catch (err: any) {
      if (err.code === 4902) {
        log('🛠️ Сеть Somnia не найдена, добавляем...');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SOMNIA_PARAMS],
        });
      } else {
        log(`❗ Не удалось переключиться: ${err.message}`);
        throw err;
      }
    }
  };

  const connect = async () => {
    if (!provider) {
      log('Провайдер не найден.');
      return;
    }
    try {
      await ensureCorrectChain();
      const [addr] = await provider.send('eth_requestAccounts', []);
      const sig = provider.getSigner();
      const c = new ethers.Contract(
        CONTRACT_ADDRESS,
        GameLifecycleABI.abi,
        sig
      );

      setAccount(addr);
      setSigner(sig);
      setContract(c);

      log(`✅ Кошелек подключен: ${addr}`);

      const ownerAddress = await c.owner();
      if (addr.toLowerCase() === ownerAddress.toLowerCase()) {
        setIsOwner(true);
        log('👑 Вы подключены как владелец контракта.');
      }
    } catch (error: any) {
      log(`❗ Ошибка подключения: ${error.message}`);
    }
  };

  // --- Логика Игры ---

  const handleStartQuiz = async () => {
    if (!contract) {
      log('Контракт не инициализирован.');
      return;
    }

    setIsLoading(true);
    log('🔮 Генерируем уникальный вопрос из глубин Средиземья...');

    try {
      const questionRange = Math.round(Math.random() * 100);
      const stakeAmountValue = getStakeAmount(questionRange);
      const prompt = getPrompt(questionRange, []);
      const response = await requestToOpenRouter(prompt);
      const content = response?.choices?.[0]?.message?.content;

      if (!content) throw new Error('LLM не вернул контент.');

      const jsonObj = JSON.parse(
        content
          .replace(/```json\n?/, '')
          .replace(/```\n?/, '')
          .trim()
      );
      const { question, options, correctAnswer } = jsonObj;

      const gameId = uuidv4();
      const dataHash = ethers.utils.solidityKeccak256(
        ['bytes32', 'string', 'string'],
        [ethers.utils.id(gameId), question, correctAnswer]
      );

      log('🎲 Вопрос сгенерирован. Фиксируем ставку и начинаем игру...');

      // Approve STT tokens (если необходимо) - предполагаем, что approve уже сделан
      const stakeAmount = ethers.utils.parseEther(stakeAmountValue);

      const tx = await contract.startGame(
        ethers.utils.id(gameId),
        dataHash,
        stakeAmount
      );
      await tx.wait();

      log(
        `✅ Игра ${gameId.slice(0, 8)}... начата. Ставка ${stakeAmountValue} STT зафиксирована.`
      );

      const difficulty = questionRange;
      const gameDuration = Math.max(10, Math.floor(difficulty / 2));

      setGameData({
        question,
        options,
        correctAnswer,
        difficulty,
        gameId,
        dataHash,
      });
      setTimer(gameDuration);
      setIsLoading(false);
    } catch (error: any) {
      log(`❗ Ошибка на старте игры: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleAnswer = async (selectedAnswer: string) => {
    if (!contract || !gameData) {
      log('Нет активной игры для ответа.');
      return;
    }

    log(`Вы выбрали: "${selectedAnswer}". Отправляем на проверку...`);
    setTimer(0); // Останавливаем таймер

    try {
      const playerWasCorrect = selectedAnswer === gameData.correctAnswer;

      const tx = await contract.endGame(
        ethers.utils.id(gameData.gameId),
        gameData.question,
        gameData.correctAnswer,
        playerWasCorrect
      );
      await tx.wait();

      if (playerWasCorrect) {
        log(
          `⚔️ Верно! Ваша награда в ${ethers.utils.formatEther(ethers.utils.parseEther(getStakeAmount(gameData.difficulty)).mul(2))} STT уже в пути!`
        );
      } else {
        log(`🌑 Увы, ответ неверный. Ваша ставка отправляется в сокровищницу.`);
      }
    } catch (error: any) {
      log(`❗ Ошибка при завершении игры: ${error.message}`);
    } finally {
      setGameData(null); // Сбрасываем игру
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !isOwner) {
      log('Эта функция доступна только владельцу.');
      return;
    }
    log('💰 Владелец забирает накопленные ставки...');
    try {
      const tx = await contract.withdrawStakes(account);
      await tx.wait();
      log('✅ Средства успешно выведены.');
    } catch (error: any) {
      log(`❗ Ошибка вывода средств: ${error.message}`);
    }
  };

  // --- Таймер ---
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (gameData) {
      log('⏳ Время вышло! Игра завершена.');
      setGameData(null);
    }
  }, [timer, gameData, log]);

  return (
    <>
      <style>{styles}</style>
      <div className="quiz-container">
        <div className="main-content">
          <div className="game-panel">
            <h1>Хроники Средиземья</h1>
            <p>
              Испытайте свои знания в викторине по вселенной Властелина Колец!
            </p>

            {!account ? (
              <button onClick={connect}>Подключить кошелек</button>
            ) : (
              <>
                <p>
                  👤 {account.slice(0, 6)}...{account.slice(-4)}
                </p>
                {isLoading ? (
                  <div>
                    <div className="loader"></div>
                    <p>Духи Айнур создают для вас вопрос...</p>
                  </div>
                ) : gameData ? (
                  <div>
                    <h2>{gameData.question}</h2>
                    <p className="timer">{timer}с</p>
                    <div className="options-grid">
                      {gameData.options.map((opt, idx) => (
                        <button key={idx} onClick={() => handleAnswer(opt)}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={handleStartQuiz}>
                      Начать новую игру (0.01-1 STT)
                    </button>
                    {isOwner && (
                      <button onClick={handleWithdraw}>
                        Забрать сокровища
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="log-panel">
            <h3>Свиток событий:</h3>
            {logs.map((l, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">[{l.time}]</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
