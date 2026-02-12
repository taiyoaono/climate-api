import { formatKwh, formatPercent, formatCurrency, formatNumber, formatPercentRaw } from '../../utils/formatters';

const CARD_STYLES = [
  { border: 'border-l-amber-500', icon: '⚡' },
  { border: 'border-l-blue-500', icon: '📊' },
  { border: 'border-l-green-500', icon: '📈' },
  { border: 'border-l-purple-500', icon: '💰' },
  { border: 'border-l-emerald-500', icon: '🔧' },
];

function Card({ label, value, unit, borderClass }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderClass} shadow-sm p-4 hover:shadow-md transition-shadow`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function AnnualSummary({ annual, lossBreakdown }) {
  const cards = [
    { label: '年間発電量', value: formatKwh(annual.total_kwh) },
    { label: '日平均発電量', value: formatNumber(annual.avg_daily_kwh, 2), unit: 'kWh/日' },
    { label: '設備利用率', value: formatPercent(annual.capacity_factor) },
  ];

  if (annual.estimated_savings != null) {
    cards.push({ label: '年間節約額', value: formatCurrency(annual.estimated_savings) });
  }

  if (lossBreakdown?.total_system_efficiency != null) {
    cards.push({ label: 'システム効率', value: formatPercentRaw(lossBreakdown.total_system_efficiency) });
  }

  return (
    <div className="grid grid-cols-2 gap-3 animate-fadeIn">
      {cards.map((c, i) => (
        <Card key={c.label} {...c} borderClass={CARD_STYLES[i % CARD_STYLES.length].border} />
      ))}
    </div>
  );
}
