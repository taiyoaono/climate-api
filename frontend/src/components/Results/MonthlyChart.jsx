import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { MONTH_NAMES_SHORT_JA, CHART_COLORS } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function MonthlyChart({ monthly }) {
  const data = {
    labels: MONTH_NAMES_SHORT_JA,
    datasets: [
      {
        label: '月間発電量 (kWh)',
        data: monthly.map((m) => m.total_kwh),
        backgroundColor: CHART_COLORS.bar,
        borderColor: CHART_COLORS.barBorder,
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: CHART_COLORS.barHover,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y.toFixed(1)} kWh`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'kWh' },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">月別発電量</h3>
      <div style={{ height: '220px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
