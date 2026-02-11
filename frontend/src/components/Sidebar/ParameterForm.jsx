import { useState, useEffect } from 'react';
import { defaultTilt, defaultAzimuth } from '../../utils/defaults';

export default function ParameterForm({ location, onSubmit, loading }) {
  const [params, setParams] = useState({
    panel_capacity_kw: '5',
    tilt: '',
    azimuth: '',
    electricity_rate: '',
  });

  useEffect(() => {
    if (location) {
      setParams((prev) => ({
        ...prev,
        tilt: defaultTilt(location.lat).toFixed(1),
        azimuth: defaultAzimuth(location.lat).toFixed(0),
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location) return;
    onSubmit({
      lat: location.lat,
      lon: location.lon,
      panel_capacity_kw: parseFloat(params.panel_capacity_kw) || 5,
      tilt: params.tilt !== '' ? parseFloat(params.tilt) : null,
      azimuth: params.azimuth !== '' ? parseFloat(params.azimuth) : null,
      electricity_rate: params.electricity_rate !== '' ? parseFloat(params.electricity_rate) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パネル容量 (kW)
        </label>
        <input
          type="number"
          name="panel_capacity_kw"
          value={params.panel_capacity_kw}
          onChange={handleChange}
          min="0.1"
          step="0.1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            傾斜角 (°)
          </label>
          <input
            type="number"
            name="tilt"
            value={params.tilt}
            onChange={handleChange}
            min="0"
            max="90"
            step="0.1"
            placeholder="自動"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            方位角 (°)
          </label>
          <input
            type="number"
            name="azimuth"
            value={params.azimuth}
            onChange={handleChange}
            min="0"
            max="360"
            step="1"
            placeholder="自動"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          電気料金 (円/kWh)
          <span className="text-gray-400 ml-1">任意</span>
        </label>
        <input
          type="number"
          name="electricity_rate"
          value={params.electricity_rate}
          onChange={handleChange}
          min="0"
          step="0.1"
          placeholder="例: 30"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      <button
        type="submit"
        disabled={!location || loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
      >
        {loading ? 'シミュレーション中…' : 'シミュレーション実行'}
      </button>
    </form>
  );
}
