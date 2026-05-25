"use client";

import React, { useState, useEffect } from "react";
import { DocTabs } from "@/components/document-management/DocTabs";
import { ShieldCheck, ShieldAlert, CheckCircle, Search, Download, MoreVertical, Eye } from "lucide-react";
import { useDocumentStore } from "@/lib/useDocumentStore";
import { DocumentTable } from "@/components/document-management/DocumentTable";

export default function CompliancePage() {
  const store = useDocumentStore();
  const [role, setRole] = useState<string>("Owner");

  useEffect(() => {
    const stored = localStorage.getItem("skitech_role");
    if (stored) setRole(stored);
  }, []);

  // Filter compliance specific files
  const complianceDocs = store.documents.filter(d => 
    d.category === "Legal" || d.category === "HR" || d.tags.includes("compliance") || d.tags.includes("audit")
  );

  const totalCount = complianceDocs.length;
  const expiredCount = complianceDocs.filter(d => d.status === "Rejected").length;
  const pendingCount = complianceDocs.filter(d => d.status === "Pending Approval").length;

  return (
    <div className="space-y-6 pb-20 font-[family-name:var(--font-merriweather)] max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight font-serif">Compliance & Legal</h1>
        <p className="text-neutral-500 mt-1 text-sm font-light">Index, review, and certify organizational compliance, legal archives, and audits.</p>
      </div>

      <DocTabs />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            {expiredCount > 0 && (
              <span className="text-red-600 text-[10px] font-black px-2 py-0.5 bg-red-50 rounded uppercase tracking-wider">Expired</span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black text-black mb-1">{expiredCount}</h3>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Expired / Rejected Records</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
            </div>
            {pendingCount > 0 && (
              <span className="text-orange-600 text-[10px] font-black px-2 py-0.5 bg-orange-50 rounded uppercase tracking-wider">Action Needed</span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black text-black mb-1">{pendingCount}</h3>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Pending Audit Approvals</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-green-600 text-[10px] font-black px-2 py-0.5 bg-green-50 rounded uppercase tracking-wider">Secure</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-black mb-1">96.8%</h3>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">General Compliance Rate</p>
          </div>
        </div>
      </div>

      {/* Compliance Database Table */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="text-xl font-bold text-black font-serif">Legal Registries</h3>
          <span className="text-neutral-400 text-xs font-mono">{totalCount} files categorized</span>
        </div>
        
        <DocumentTable documents={complianceDocs} role={role} />
      </div>

    </div>
  );
}
