import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getBlockDataByNumberSomnia, getSomniaStats, getTransactionsPerDays } from './utils/apis';
import { chartConfig, delay, defaultChartLabels } from './chartConfig';
import Chart from 'chart.js/auto';

const secondPerDay = Math.round(24 * 60 * 60);
const blocksPerSecond = 10;
const firstBlockDate = new Date('2025-02-18');
const blocksPerDay = Math.round(secondPerDay * blocksPerSecond);
const blocksPerHour = Math.round(blocksPerDay / 24);

export const EvolutionVisualizer = () => {
  const [txhsPerDays, setTxhsPerDays] = useState([]);
  const [currentLabels, setCurrentLabels] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const canvasRef = useRef(null);
  const canvasPanelRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const ctxPanelRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationFrameId = useRef(null);
  const panelContainerRef = useRef(null);
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    if (!canvasPanelRef.current) return;
    const canvas = canvasPanelRef.current;
    const ctx = canvas.getContext('2d');
    ctxPanelRef.current = ctx;

    canvas.width = panelContainerRef.current.clientWidth;
    canvas.height = 600;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 600, 600);

    setCurrentIndex(0);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setCurrentIndex(0);
      setForceUpdate((prev) => !prev);
      if (ctxPanelRef.current && canvasPanelRef.current) {
        ctxPanelRef.current.fillStyle = 'black';
        ctxPanelRef.current.fillRect(0, 0, panelContainerRef.current.clientWidth, 600);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const prepareCoords = useCallback(() => {
    if (!ctxPanelRef.current || currentIndex >= txhsPerDays.length) {
      return;
    }

    const amountPerDays = txhsPerDays.map((it) => Math.round(it.txhs / 50_000));
    const pixelsWithCoords = amountPerDays.map((it) => {
      const coords = [];
      for (let i = 0; i < it; i++) {
        const x = Math.round(Math.random() * 700);
        const y = Math.round(Math.random() * 600);
        coords.push({ x, y });
      }
      return {
        amount: it,
        coords,
      };
    });

    return pixelsWithCoords;
  }, [currentIndex, txhsPerDays]);

  const resetAll = useCallback(() => {
    setTxhsPerDays([]);
    setCurrentLabels([]);
    setCurrentData([]);
    ctxPanelRef.current.fillStyle = 'black';
    ctxPanelRef.current.fillRect(0, 0, 700, 600);
  }, []);

  const prepareChartData = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Chart(ctx, chartConfig);
    } else {
      chartInstanceRef.current.data.labels = currentLabels;
      chartInstanceRef.current.data.datasets[0].data = currentData;
      chartInstanceRef.current.update();
    }
  }, [currentLabels, currentData]);

  const runAnimation = useCallback(async () => {
    setCurrentLabels([]);
    setCurrentData([]);
    const sourceLabels = defaultChartLabels(txhsPerDays);
    const pixelsWithCoords = prepareCoords();

    await delay(50);

    for (let i = 0; i < sourceLabels.length; i++) {
      setCurrentLabels((prevLabels) => [...prevLabels, sourceLabels[i]]);
      setCurrentData((prevData) => [...prevData, Math.round(txhsPerDays[i].txhs / 1000_000)]);

      pixelsWithCoords[i].coords.forEach((it) => {
        ctxPanelRef.current.fillStyle = '#FFFFE0';
        ctxPanelRef.current.fillRect(it.x, it.y, 1, 1);
      });

      if (i < sourceLabels.length - 1) {
        await delay(200);
      }
    }
    console.log('Анимация графика завершена.');
  }, [txhsPerDays, prepareCoords]);

  const prepareDateToView = useCallback(async () => {
    const response = await getTransactionsPerDays();
    const stats = await getSomniaStats();

    const fullTxhs = stats?.data?.total_transactions ?? 0;

    const countDay = (str_date) => {
      const date = new Date(str_date);
      return (date.getTime() - firstBlockDate.getTime()) / (1000 * 60 * 60 * 24);
    };

    const data = response?.data?.chart_data.reverse();
    const finalSumma = data
      .map((it) => it.transaction_count)
      .reduce((prev, current) => prev + current, 0);
    const prevTxhsAmount = fullTxhs - finalSumma;

    const transactionsPerDays = data?.map((it, index) => {
      let summa = 0;
      for (let i = 0; i < index; i++) {
        summa += data?.[i].transaction_count;
      }
      return {
        day: countDay(it.date),
        txhs: it.transaction_count,
        summaTxhs: summa,
        proportion: Math.ceil((it.transaction_count * 100) / fullTxhs),
      };
    });

    const minDay = Math.min(...transactionsPerDays.map((it) => it.day));

    const artificialTxhs = [];

    for (let day = 1; day < minDay; day++) {
      const artificialValue = Math.round((prevTxhsAmount / minDay) * Math.random() * 3);
      artificialTxhs.push(artificialValue);
    }

    const dataBeforeThisMonth = artificialTxhs.map((it, index) => {
      let summa = 0;
      for (let i = 0; i < index; i++) {
        summa += artificialTxhs?.[i];
      }
      return {
        day: index + 1,
        txhs: it,
        summaTxhs: summa,
        proportion: Math.ceil((it * 100) / fullTxhs),
      };
    });

    setTxhsPerDays([...dataBeforeThisMonth, ...transactionsPerDays]);
  }, [setTxhsPerDays]);

  useEffect(() => {
    prepareChartData();
  }, [prepareChartData]);

  useEffect(() => {
    console.log('Запуск анимации графика...');
    runAnimation();
  }, [runAnimation]);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <button onClick={prepareDateToView}>Run blockchain life</button>
        <button onClick={resetAll}>Clear all data</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ height: '600px', width: '50%', padding: '10px' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
        <div ref={panelContainerRef} style={{ height: '600px', width: '50%', padding: '10px' }}>
          <canvas style={{ border: '1px solid black' }} ref={canvasPanelRef}></canvas>
        </div>
      </div>
    </div>
  );
};
