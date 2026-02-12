export default function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative ${
            activeTab === tab.key
              ? 'text-amber-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t" />
          )}
        </button>
      ))}
    </div>
  );
}
