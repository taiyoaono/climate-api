import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { MONTH_NAMES_SHORT_JA, CHART_COLORS } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function EnvironmentalChart({ monthly }) {
  const data = {
    labels: MONTH_NAMES_SHORT_JA,
    datasets: [
      {
        label: '平均気温 (℃)',
        data: monthly.map((m) => m.avg_temp_c),
        borderColor: CHART_COLORS.tempLine,
        backgroundColor: CHART_COLORS.tempFill,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: '日射量 (kWh/m²)',
        data: monthly.map((m) => m.avg_radiation_kwh_m2),
        borderColor: CHART_COLORS.radiationLine,
        backgroundColor: CHART_COLORS.radiationFill,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const unit = ctx.datasetIndex === 0 ? '℃' : 'kWh/m²';
            return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} ${unit}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: '気温 (℃)', color: CHART_COLORS.tempLine },
        ticks: { color: CHART_COLORS.tempLine },
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: '日射量 (kWh/m²)', color: CHART_COLORS.radiationLine },
        ticks: { color: CHART_COLORS.radiationLine },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">気温・日射量</h3>
      <div style={{ height: '220px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
