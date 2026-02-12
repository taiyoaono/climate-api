import { useState, useEffect } from 'react';
import ParameterForm from './ParameterForm';
import ResultsPanel from '../Results/ResultsPanel';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorBanner from '../UI/ErrorBanner';

export default function Sidebar({ location, data, loading, error, onSubmit }) {
  const [activeTab, setActiveTab] = useState('summary');

  // Reset to summary tab when new simulation data arrives
  useEffect(() => {
    if (data) {
      setActiveTab('summary');
    }
  }, [data]);

  return (
    <aside className="w-full md:w-[480px] flex-shrink-0 h-full overflow-y-auto bg-gray-50 border-l border-gray-200">
      <div className="p-5 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Solar Power Simulator</h1>
          <p className="text-xs text-gray-500 mt-1">
            {location
              ? `選択地点: ${location.lat}, ${location.lon}`
              : '地図をクリックして場所を選択してください'}
          </p>
        </div>

        <ParameterForm location={location} onSubmit={onSubmit} loading={loading} />

        <ErrorBanner message={error} />

        {loading && <LoadingSpinner />}

        {data && !loading && (
          <ResultsPanel data={data} activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>
    </aside>
  );
}
