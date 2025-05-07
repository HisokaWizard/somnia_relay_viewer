import { getSomniaStats, getTransactionsPerDays } from './apis';

const firstBlockDate = new Date('2025-02-18');

export const prepareDataForSomniaVisualizer = async () => {
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

  return {
    transactionsPerDays,
    dataBeforeThisMonth,
  };
};

export const countCoords = (txhsPerDays) => {
  const amountPerDays = txhsPerDays.map((it) => Math.round(it.txhs / 10_000));
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
};
