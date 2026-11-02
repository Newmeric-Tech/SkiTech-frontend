"use client";

import MyKras from "@/components/kra-tasks/MyKras";

export default function StaffKRAPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">KRA Center</h1>
        <p className="text-slate-500 text-sm mt-1">The tasks assigned to you, for each period. Mark them delayed or completed.</p>
      </div>
      <MyKras />
    </div>
  );
}
