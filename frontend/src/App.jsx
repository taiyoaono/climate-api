import { useState } from 'react';
import MapView from './components/Map/MapView';
import Sidebar from './components/Sidebar/Sidebar';
import useSimulation from './hooks/useSimulation';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { data, loading, error, run, clear } = useSimulation();

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    clear();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex-1 h-[50vh] md:h-full">
        <MapView
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
        />
      </div>
      <Sidebar
        location={selectedLocation}
        data={data}
        loading={loading}
        error={error}
        onSubmit={run}
      />
    </div>
  );
}
