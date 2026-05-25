"use client";

import React, { useState, useEffect } from "react";
import { DocTabs } from "@/components/document-management/DocTabs";
import { DocumentTable } from "@/components/document-management/DocumentTable";
import { useDocumentStore } from "@/lib/useDocumentStore";

export default function SharedDocumentsPage() {
  const store = useDocumentStore();
  const [role, setRole] = useState<string>("Owner");

  useEffect(() => {
    const stored = localStorage.getItem("skitech_role");
    if (stored) setRole(stored);
  }, []);

  const sharedDocs = store.documents.filter(d => d.isShared);

  return (
    <div className="space-y-6 pb-20 font-[family-name:var(--font-merriweather)] max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight font-serif">Shared Registry</h1>
        <p className="text-neutral-500 mt-1 text-sm font-light">Collaborate on shared corporate briefings, templates, and team directories.</p>
      </div>

      <DocTabs />

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="text-xl font-bold text-black font-serif">Shared Collection</h3>
          <span className="text-neutral-400 text-xs font-mono">{sharedDocs.length} public records</span>
        </div>
        
        <DocumentTable documents={sharedDocs} role={role} />
      </div>
    </div>
  );
}
