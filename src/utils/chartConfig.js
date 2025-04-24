export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const defaultChartLabels = (data) => data.map((_, index) => `Day ${index + 1}`);

export const chartConfig = {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Daily Transactions (Millions)',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Transactions (Millions)',
        },
        ticks: {
          callback: function (value) {
            return value + 'M';
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Somnia lifecycle',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' Million';
            }
            return label;
          },
        },
      },
    },
    animation: {
      duration: 300,
      easing: 'linear',
    },
  },
};
