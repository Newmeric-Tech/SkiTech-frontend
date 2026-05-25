"use client";

import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: FilterDropdownProps) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full px-4 py-2.5 pr-10 bg-white border border-slate-200/60 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-300 transition-all cursor-pointer hover:bg-slate-50"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
