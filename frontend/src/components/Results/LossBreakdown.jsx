import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CHART_COLORS } from '../../utils/constants';
import { formatPercentRaw } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const LOSS_ITEMS = [
  { key: 'soiling_loss', label: '汚れ損失', color: CHART_COLORS.soiling, border: CHART_COLORS.soilingBorder },
  { key: 'wiring_loss', label: '配線損失', color: CHART_COLORS.wiring, border: CHART_COLORS.wiringBorder },
  { key: 'inverter_loss', label: 'インバーター損失', color: CHART_COLORS.inverter, border: CHART_COLORS.inverterBorder },
  { key: 'temp_loss_avg', label: '温度損失', color: CHART_COLORS.temperature, border: CHART_COLORS.temperatureBorder },
];

export default function LossBreakdown({ lossBreakdown }) {
  if (!lossBreakdown) return null;

  const efficiency = lossBreakdown.total_system_efficiency;
  const totalLoss = 100 - efficiency;

  const segments = LOSS_ITEMS.map((item) => ({
    ...item,
    value: Math.abs(lossBreakdown[item.key] ?? 0),
  })).filter((s) => s.value > 0);

  const chartData = {
    labels: ['システム効率', ...segments.map((s) => s.label)],
    datasets: [
      {
        data: [efficiency, ...segments.map((s) => s.value)],
        backgroundColor: [
          CHART_COLORS.efficiency,
          ...segments.map((s) => s.color),
        ],
        borderColor: [
          CHART_COLORS.efficiencyBorder,
          ...segments.map((s) => s.border),
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Efficiency headline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">システム総合効率</p>
        <p className="text-3xl font-bold text-green-600 mt-1">{formatPercentRaw(efficiency)}</p>
        <p className="text-xs text-gray-400 mt-1">総損失: {formatPercentRaw(totalLoss)}</p>
      </div>

      {/* Doughnut chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">損失内訳 (JIS C 8907)</h3>
        <div style={{ height: '220px' }} className="flex items-center justify-center">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Legend list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: CHART_COLORS.efficiency }}
              />
              <span className="text-sm text-gray-700">システム効率</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatPercentRaw(efficiency)}</span>
          </div>
          {segments.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm text-gray-700">{s.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">-{formatPercentRaw(s.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
