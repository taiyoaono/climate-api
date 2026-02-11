import { MONTH_NAMES } from '../../utils/constants';

export default function MonthlyTable({ monthly }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
            <th className="px-3 py-2 text-left">月</th>
            <th className="px-3 py-2 text-right">合計 kWh</th>
            <th className="px-3 py-2 text-right">日平均 kWh</th>
            <th className="px-3 py-2 text-right">平均気温</th>
            <th className="px-3 py-2 text-right">日射量</th>
          </tr>
        </thead>
        <tbody>
          {monthly.map((m, i) => (
            <tr key={m.month} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 font-medium">{MONTH_NAMES[i]}</td>
              <td className="px-3 py-2 text-right">{m.total_kwh.toFixed(1)}</td>
              <td className="px-3 py-2 text-right">{m.avg_daily_kwh.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{m.avg_temp_c.toFixed(1)}℃</td>
              <td className="px-3 py-2 text-right">{m.avg_radiation_kwh_m2.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
