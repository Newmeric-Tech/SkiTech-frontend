"use client";

import React, { useState, useEffect } from "react";
import { DocTabs } from "@/components/document-management/DocTabs";
import { DocumentTable } from "@/components/document-management/DocumentTable";
import { useDocumentStore } from "@/lib/useDocumentStore";
import { Archive, Trash2 } from "lucide-react";

export default function ArchivedDocumentsPage() {
  const store = useDocumentStore();
  const [role, setRole] = useState<string>("Owner");

  useEffect(() => {
    const stored = sessionStorage.getItem("skitech_role");
    if (stored) setRole(stored);
  }, []);

  const archivedDocs = store.documents.filter(d => d.status === "Archived");

  return (
    <div className="space-y-6 pb-20 font-[family-name:var(--font-merriweather)] max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight font-serif">Archived Records</h1>
        <p className="text-neutral-500 mt-1 text-sm font-light">Access, inspect, or restore deleted or legacy organization data files.</p>
      </div>

      <DocTabs />

      {archivedDocs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <h3 className="text-xl font-bold text-black font-serif">Archive Collection</h3>
            <span className="text-neutral-400 text-xs font-mono">{archivedDocs.length} archived files</span>
          </div>
          
          <DocumentTable documents={archivedDocs} role={role} />
        </div>
      ) : (
        <div className="bg-white border border-black/10 rounded-3xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 border border-black/5">
            <Archive className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-black mb-1 font-serif">No Archives Registered</h3>
          <p className="text-neutral-500 max-w-sm text-xs font-light leading-relaxed">Your organization archive registry is clean. Documents can be archived or retrieved using context actions.</p>
        </div>
      )}
    </div>
  );
}
