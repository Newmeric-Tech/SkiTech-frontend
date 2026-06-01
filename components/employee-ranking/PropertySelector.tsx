"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { propertiesAPI, Property } from "@/lib/api/properties";

interface PropertySelectorProps {
  selectedId: string;
  onChange: (propertyId: string, propertyName: string) => void;
}

export default function PropertySelector({ selectedId, onChange }: PropertySelectorProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesAPI
      .list()
      .then((res) => {
        const list = res.data ?? [];
        setProperties(list);
        // Auto-select the first property if none selected
        if (!selectedId && list.length > 0) {
          onChange(list[0].id, list[0].name);
        }
      })
      .finally(() => setLoading(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const selected = properties.find((p) => p.id === selectedId);

  if (loading) {
    return <div className="h-10 w-52 rounded-xl bg-slate-100 animate-pulse" />;
  }

  if (properties.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 px-3 py-2 bg-white border border-slate-200 rounded-xl">
        <Building2 className="w-4 h-4" />
        No properties found
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm min-w-[200px] justify-between"
      >
        <span className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          {selected?.name ?? "Select property"}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-full min-w-[220px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {properties.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id, p.name); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                p.id === selectedId
                  ? "bg-slate-950 text-white font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
