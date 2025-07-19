import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { requestToOpenRouter, useWeb3State } from '@/shared';
import { getUniversalQuizPromptEn } from './QuizGenerator.prompt';
import OptimizedQuizGameABI from '../../../artifacts/contracts/OptimizedQuizGame.sol/OptimizedQuizGame.json';
import { useNavigate } from 'react-router';
import { WidgetStyles } from './QuizGenerator.styles';
import { GameRules } from './QuizGenerator.rules';
import { v4 as uuidv4 } from 'uuid';
import { keccak256 } from 'js-sha3';

type LLMGameData = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type UserQuestionData = {
  id: string;
  question: string;
  answerHash: string;
};

type QuestionData = {
  index: number;
  id: string;
  question: string;
  options: string[];
  correctAnswerHash: string;
  difficulty: number;
  cost: number;
};

type GameData = {
  id: string;
  questions: QuestionData[];
  fullCost: number;
};

const CONTRACT_ADDRESS = process.env.CONTRACT_QUIZ_ADDRESS ?? '';

type GameState =
  | 'IDLE'
  | 'CUSTOMIZING'
  | 'GENERATING_QUIZ'
  | 'QUIZ_READY'
  | 'AWAITING_COMMIT'
  | 'GAME_IN_PROGRESS'
  | 'GAME_FINISHED'
  | 'AWAITING_REVEAL'
  | 'GAME_OVER';

export const GameWidget = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [quizPack, setQuizPack] = useState<GameData | null>();
  const [userQuestionData, setUserQuestionData] = useState<UserQuestionData[]>(
    []
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [topic, setTopic] = useState('The Lord of the Rings');
  const [timer, setTimer] = useState<number>(0);

  const navigate = useNavigate();

  const { log, connect, contract, account, isOwner, logs } = useWeb3State();

  const handleGenerateQuiz = useCallback(async () => {
    setGameState('GENERATING_QUIZ');
    log('🔮 Generating 10 questions based on your topic...');
    try {
      const levels = Array.from({ length: 10 }, () =>
        Math.round(Math.random() * 100)
      );
      const prompt = getUniversalQuizPromptEn(
        topic,
        `an unparalleled expert on ${topic}`,
        levels
      );
      const content = await requestToOpenRouter(prompt);

      const pack: LLMGameData[] = JSON.parse(content);
      const questions: QuestionData[] = pack.map(
        (question: LLMGameData, index: number) => ({
          index,
          id: uuidv4(),
          question: question.question,
          correctAnswerHash: keccak256(question.correctAnswer),
          options: question.options,
          difficulty: levels[index],
          cost: levels[index] * 0.01,
        })
      );

      const game: GameData = {
        id: uuidv4(),
        questions: questions,
        fullCost: questions.reduce((prev, curr) => prev + curr.cost, 0),
      };

      setQuizPack(game);
      setGameState('QUIZ_READY');
      log(
        `✅ Quiz ready! Please answer the questions to form your commitment.`
      );
    } catch (error: any) {
      log(`❗ Error generating quiz: ${error.message}`);
      setGameState('CUSTOMIZING');
    }
  }, [log, topic]);

  const handleStartGame = useCallback(async () => {
    if (!contract || !quizPack) return log('Contract or quiz not ready.');

    setGameState('AWAITING_COMMIT');
    log(`Calculating your commitment...`);

    try {
      log(`Your Game ID: ${ethers.utils.hexlify(quizPack.id).slice(0, 10)}...`);
      log(
        `Total stake: ${ethers.utils.formatEther(quizPack.fullCost)} STT. Please confirm transaction.`
      );

      const tx = await contract.startGame(quizPack.id, quizPack.fullCost);

      await tx.wait();

      log('✅ Commitment successful! The timed trial begins NOW!');

      const questionTimer = Math.max(
        10,
        Math.floor(quizPack.questions[0].difficulty / 2)
      );
      setTimer(questionTimer);
      setCurrentQuestionIndex(0);
      setGameState('GAME_IN_PROGRESS');
    } catch (error: any) {
      log(`❗ Error committing to game: ${error.message}`);
      setGameState('QUIZ_READY');
    }
  }, [contract, log, quizPack]);

  const handleNextQuestion = useCallback(() => {
    if (!quizPack || currentQuestionIndex === null) {
      throw 'No quiz pack or game not started';
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }, [quizPack, currentQuestionIndex, log]);

  const handleAnswerSelect = useCallback(
    (answer: string) => {
      if (!quizPack || currentQuestionIndex === null) {
        throw 'No quiz pack or game not started';
      }

      const answerHash = keccak256(answer);

      const userAnswer: UserQuestionData = {
        answerHash,
        id: quizPack.questions[currentQuestionIndex].id,
        question: quizPack.questions[currentQuestionIndex].question,
      };
      setUserQuestionData((prev) => [...prev, userAnswer]);

      log(`You selected: "${answer}"`);

      if (currentQuestionIndex >= quizPack.questions.length - 1) {
        setGameState('GAME_FINISHED');
        log(
          "🏁 You have answered all questions! Press 'Finish Game' to claim your result."
        );
      }

      setTimer(0);
    },
    [currentQuestionIndex]
  );

  const handleEndGame = useCallback(async () => {
    if (!contract || !quizPack?.id) return log('No active game found.');

    setGameState('AWAITING_REVEAL');
    log('Revealing your answers to the Oracle... Please confirm transaction.');

    try {
      let finalPrize = 0;
      userQuestionData.forEach((it, index) => {
        const question = quizPack.questions[index];
        if (
          it.id === question.id &&
          it.answerHash === question.correctAnswerHash
        ) {
          finalPrize += question.cost * 2;
        }
      });
      const tx = await contract.endGame(quizPack.id, finalPrize);
      await tx.wait();

      log(`⚔️ Your trial is complete! The Oracle has judged your performance.`);
      setGameState('GAME_OVER');
    } catch (error: any) {
      log(`❗ Error revealing answers: ${error.message}`);
      setGameState('GAME_FINISHED');
    }
  }, [contract, log, quizPack, userQuestionData]);

  useEffect(() => {
    if (timer > 0 && gameState === 'GAME_IN_PROGRESS') {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }

    if (timer === 0 && gameState === 'GAME_IN_PROGRESS') {
      log('⏳ Time is over. Answer written as incorrect, sorry.');
      const answerHash = keccak256('Player answer incorrect');

      if (!quizPack || currentQuestionIndex === null) {
        throw 'No quiz pack or game not started';
      }

      const userAnswer: UserQuestionData = {
        answerHash,
        id: quizPack.questions[currentQuestionIndex].id,
        question: quizPack.questions[currentQuestionIndex].question,
      };
      setUserQuestionData((prev) => [...prev, userAnswer]);
    }
  }, [timer, quizPack]);

  const resetGame = useCallback(() => {
    setGameState('CUSTOMIZING');
    setQuizPack(null);
    setCurrentQuestionIndex(null);
    log('A new trial awaits...');
  }, [log]);

  const renderGameContent = () => {
    if (!account)
      return (
        <button
          className="btn"
          onClick={() => connect(CONTRACT_ADDRESS, OptimizedQuizGameABI.abi)}
        >
          Connect Wallet
        </button>
      );

    switch (gameState) {
      case 'CUSTOMIZING':
        return (
          <div className="w-full max-w-md text-center">
            <h2 className="font-fantasy text-3xl mb-4">Challenge the Oracle</h2>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 bg-gray-900/50 border border-violet-700 rounded-lg text-center text-lg focus:ring-2 focus:ring-violet-500 focus:outline-none mb-4 input-theme"
            />
            <button className="btn" onClick={handleGenerateQuiz}>
              Forge My Trial
            </button>
          </div>
        );
      case 'GENERATING_QUIZ':
        return (
          <div>
            <div className="loader"></div>
            <p>
              The great spirits of quizzes are preparing incredible questions
              for you...
            </p>
          </div>
        );
      case 'QUIZ_READY':
        // Этап ответов для коммита
        return (
          <div className="w-full">
            <h2 className="font-fantasy text-2xl mb-4">Prepare Your Answers</h2>
            <p className="text-gray-400 mb-4">
              Answer these to form your commitment. No timer yet.
            </p>
            {/* Здесь может быть список всех вопросов для ответов */}
            <button className="btn btn-green" onClick={handleStartGame}>
              Lock Answers & Start Game
            </button>
          </div>
        );
      case 'AWAITING_COMMIT':
      case 'AWAITING_REVEAL':
        return (
          <div>
            <div className="loader"></div>
            <p>Awaiting confirmation in your wallet...</p>
          </div>
        );
      case 'GAME_IN_PROGRESS':
        const q = quizPack?.questions[currentQuestionIndex ?? 0];
        return (
          <div
            className="w-full max-w-3xl text-center no-copy"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="timer">{timer}s</div>
            <h2 className="text-2xl mb-6">{q?.question}</h2>
            <div className="options-grid">
              {q?.options.map((opt) => (
                <button
                  key={opt}
                  className="btn"
                  onClick={() => handleAnswerSelect(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      case 'GAME_FINISHED':
        return (
          <div>
            <h3 className="font-fantasy text-3xl text-amber-300 mb-4">
              Trial Complete!
            </h3>
            <p className="mb-6">
              Your answers have been recorded. Reveal them now to receive
              judgment from the Oracle.
            </p>
            <button className="btn btn-green" onClick={handleEndGame}>
              Finish Game & Claim Result
            </button>
          </div>
        );
      case 'GAME_OVER':
        return (
          <div>
            <h3 className="font-fantasy text-3xl text-green-400 mb-4">
              The Trial is Over!
            </h3>
            <div className="flex">
              <button className="btn" onClick={resetGame}>
                Play Again
              </button>
              <button className="btn" onClick={() => navigate('/')}>
                Exit to Main Page
              </button>
            </div>
          </div>
        );
      case 'IDLE':
      default:
        return (
          <button className="btn" onClick={() => setGameState('CUSTOMIZING')}>
            Start
          </button>
        );
    }
  };

  return (
    <>
      <WidgetStyles />
      <div className="game-widget-container">
        <div className="game-panel">{renderGameContent()}</div>
        <div className="log-panel">
          <GameRules
            stake={
              quizPack?.fullCost
                ? `${ethers.utils.formatEther(quizPack.fullCost)} STT`
                : null
            }
          />
          <h3 className="font-fantasy text-lg text-center text-amber-300 mb-4">
            Scroll of Events
          </h3>
          <div className="log-entries-container">
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
