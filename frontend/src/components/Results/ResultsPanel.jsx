import AnnualSummary from './AnnualSummary';
import MonthlyChart from './MonthlyChart';
import MonthlyTable from './MonthlyTable';

export default function ResultsPanel({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>
          📍 {data.location.lat}, {data.location.lon}
        </span>
        <span>|</span>
        <span>標高 {data.elevation_m}m</span>
        <span>|</span>
        <span>{data.system.capacity_kw} kW</span>
      </div>

      <AnnualSummary annual={data.annual} />
      <MonthlyChart monthly={data.monthly} />
      <MonthlyTable monthly={data.monthly} />
    </div>
  );
}
