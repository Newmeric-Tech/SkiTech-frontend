"use client";

import React, { useState, useEffect } from "react";
import { DocTabs } from "@/components/document-management/DocTabs";
import { DocumentTable } from "@/components/document-management/DocumentTable";
import { useDocumentStore } from "@/lib/useDocumentStore";
import { UploadCloud, FileText, Pin, Clock, ShieldCheck, Archive } from "lucide-react";
import { motion } from "framer-motion";

export default function MyDocumentsPage() {
  const store = useDocumentStore();
  const [role, setRole] = useState<string>("Owner");

  useEffect(() => {
    const ROLE_DISPLAY: Record<string, string> = {
      owner: "Owner", manager: "Manager", staff: "Staff", superadmin: "Super Admin",
    };
    const stored = localStorage.getItem("skitech_role");
    if (stored) setRole(ROLE_DISPLAY[stored.toLowerCase()] ?? stored);
  }, []);

  // Filter documents where current user is owner or uploader
  const docs = store.documents.filter(d => d.owner === "Current User" || d.uploadedBy === "Current User");

  const totalCount = docs.length;
  const pendingCount = docs.filter(d => d.status === "Pending Approval").length;
  const approvedCount = docs.filter(d => d.status === "Active" || d.status === "Secure").length;

  return (
    <div className="font-[family-name:var(--font-merriweather)] max-w-6xl mx-auto space-y-6 pb-20">
      
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight font-serif">My Vault</h1>
        <p className="text-neutral-500 mt-1 text-sm font-light">Access your self-uploaded operational files, credentials, and custom drafts.</p>
      </div>

      <DocTabs />

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 border border-black/10 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase mb-1">TOTAL DOCUMENTS</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-black">{totalCount}</span>
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">Vault</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-black/5 text-black">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white p-5 border border-black/10 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase mb-1">PENDING REVIEW</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-black">{pendingCount}</span>
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">Awaiting</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-black/5 text-black">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-black/10 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase mb-1">APPROVED ITEMS</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-black">{approvedCount}</span>
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-black/5 text-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Access Pins */}
      <div className="mb-10 space-y-4">
        <h3 className="text-lg font-bold text-black font-serif">Pinned Vault Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 border border-black/10 rounded-2xl shadow-sm group cursor-pointer hover:border-black/30 transition-colors relative">
            <Pin className="w-4 h-4 text-black absolute top-4 right-4" />
            <div className="flex items-start gap-3 mt-2">
              <FileText className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-black text-sm group-hover:text-neutral-600">Q4_Financial_Strategy.pdf</p>
                <p className="text-xs text-neutral-400 mt-1">Uploader: Sarah W. • 2.4 MB</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 border border-black/10 rounded-2xl shadow-sm group cursor-pointer hover:border-black/30 transition-colors relative">
            <Pin className="w-4 h-4 text-black absolute top-4 right-4" />
            <div className="flex items-start gap-3 mt-2">
              <FileText className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-bold text-black text-sm group-hover:text-neutral-600">Compliance_Audit_2023.xlsx</p>
                <p className="text-xs text-neutral-400 mt-1">Uploader: Jane Doe • 1.2 MB</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 border border-black/10 rounded-2xl shadow-sm group cursor-pointer hover:border-black/30 transition-colors relative">
            <Pin className="w-4 h-4 text-black absolute top-4 right-4" />
            <div className="flex items-start gap-3 mt-2">
              <FileText className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <p className="font-bold text-black text-sm group-hover:text-neutral-600">Project_Zeus_V2.docx</p>
                <p className="text-xs text-neutral-400 mt-1">Uploader: Alice J. • 4.1 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="text-xl font-bold text-black font-serif">Vault Collection</h3>
          <span className="text-neutral-400 text-xs font-mono">{totalCount} files listed</span>
        </div>
        
        <DocumentTable documents={docs} role={role} />
      </div>

    </div>
  );
}
