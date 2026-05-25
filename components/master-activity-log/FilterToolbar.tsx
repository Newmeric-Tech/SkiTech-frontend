import React from 'react';

interface FilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSeverity: string;
  onSeverityChange: (value: string) => void;
  onExport: () => void;
}

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  onExport,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 border border-slate-200/60 shadow-sm rounded-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by user, action, details..."
          className="border border-slate-200 rounded-xl px-4 py-2.5 w-full sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors"
        />
        <select
          value={selectedSeverity}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 w-full sm:w-auto text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
        >
          <option value="All Actions">All Actions</option>
          <option value="Info">Info</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
        </select>
      </div>
      <button
        onClick={onExport}
        className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-md"
      >
        Export Logs
      </button>
    </div>
  );
};

export default FilterToolbar;