import { formatKwh, formatPercent, formatCurrency, formatNumber } from '../../utils/formatters';

function Card({ label, value, unit }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function AnnualSummary({ annual }) {
  const cards = [
    { label: '年間発電量', value: formatKwh(annual.total_kwh) },
    { label: '日平均発電量', value: formatNumber(annual.avg_daily_kwh, 2), unit: 'kWh/日' },
    { label: '設備利用率', value: formatPercent(annual.capacity_factor) },
  ];

  if (annual.estimated_savings != null) {
    cards.push({ label: '年間節約額', value: formatCurrency(annual.estimated_savings) });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <Card key={c.label} {...c} />
      ))}
    </div>
  );
}
