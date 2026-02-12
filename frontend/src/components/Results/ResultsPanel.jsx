import TabBar from '../UI/TabBar';
import AnnualSummary from './AnnualSummary';
import MonthlyChart from './MonthlyChart';
import MonthlyTable from './MonthlyTable';
import EnvironmentalChart from './EnvironmentalChart';
import LossBreakdown from './LossBreakdown';

const TABS = [
  { key: 'summary', label: '概要' },
  { key: 'monthly', label: '月別分析' },
  { key: 'loss', label: '損失分析' },
];

export default function ResultsPanel({ data, activeTab, onTabChange }) {
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

      <TabBar tabs={TABS} activeTab={activeTab} onChange={onTabChange} />

      <div className="animate-fadeIn" key={activeTab}>
        {activeTab === 'summary' && (
          <AnnualSummary annual={data.annual} lossBreakdown={data.loss_breakdown} />
        )}

        {activeTab === 'monthly' && (
          <div className="space-y-4">
            <MonthlyChart monthly={data.monthly} />
            <EnvironmentalChart monthly={data.monthly} />
            <MonthlyTable monthly={data.monthly} />
          </div>
        )}

        {activeTab === 'loss' && (
          <LossBreakdown lossBreakdown={data.loss_breakdown} />
        )}
      </div>
    </div>
  );
}
