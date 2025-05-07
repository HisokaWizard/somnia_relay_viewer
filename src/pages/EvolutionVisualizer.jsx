import React, { useEffect, useState, useRef, useCallback } from 'react';
import { chartConfig, delay, defaultChartLabels } from '@/shared/utils/chartConfig';
import { countCoords, prepareDataForSomniaVisualizer } from '@/shared/utils/visualizerCounting';
import Chart from 'chart.js/auto';

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

  /** Init canvas panel for transactions clusters visualize */
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

  /** Update canvas size with windows resize */
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

  /** Counting random coordinates for transactions */
  const prepareCoords = useCallback(() => {
    if (!ctxPanelRef.current || currentIndex >= txhsPerDays.length) {
      return;
    }

    return countCoords(txhsPerDays);
  }, [currentIndex, txhsPerDays]);

  /** Reset data for repeat activity */
  const resetAll = useCallback(() => {
    setTxhsPerDays([]);
    setCurrentLabels([]);
    setCurrentData([]);
    ctxPanelRef.current.fillStyle = 'black';
    ctxPanelRef.current.fillRect(0, 0, 600, 600);
  }, []);

  /** Prepare data and config to render Chart */
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

  /** Methods for tick animation chat and canvas transactions */
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

  /** Parepare date for canvas */
  const prepareDateToView = useCallback(async () => {
    const { dataBeforeThisMonth, transactionsPerDays } = await prepareDataForSomniaVisualizer();

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
    <div style={{ padding: 0, marging: 0 }}>
      <div style={{ display: 'flex', padding: '5px 10px' }}>
        <button style={{ padding: '5px' }} onClick={prepareDateToView}>
          Run blockchain life
        </button>
        <button style={{ padding: '5px' }} onClick={resetAll}>
          Clear all data
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ height: '600px', width: '50%', padding: '10px' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
        <div ref={panelContainerRef} style={{ height: '600px', width: '50%', padding: '10px' }}>
          <canvas ref={canvasPanelRef}></canvas>
        </div>
      </div>
    </div>
  );
};
