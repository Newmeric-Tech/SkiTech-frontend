"use client";

import React, { useState, useEffect } from "react";
import { DocTabs } from "@/components/document-management/DocTabs";
import { 
  FileText, ArrowRight, Clock, MessageSquare, Calendar, ShieldAlert,
  MoreVertical, CheckCircle, Search, LayoutGrid, List, File, Bell, X, Undo2
} from "lucide-react";
import { useDocumentStore } from "@/lib/useDocumentStore";
import { motion, AnimatePresence } from "framer-motion";

export default function UpdatesPage() {
  const store = useDocumentStore();
  const [role, setRole] = useState<string>("Owner");
  const [toastMsg, setToastMsg] = useState("");
  const [undoToast, setUndoToast] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("skitech_role");
    if (stored) setRole(stored);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleDismiss = (id: string) => {
    store.dismissUpdate(id);
    setUndoToast(true);
    setTimeout(() => setUndoToast(false), 5000);
  };

  const handleUndo = () => {
    store.undoDismissUpdate();
    setUndoToast(false);
    showToast("Notification successfully restored.");
  };

  return (
    <div className="font-[family-name:var(--font-merriweather)] max-w-6xl mx-auto space-y-6 pb-20 text-neutral-800">
      
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight font-serif">Notifications & Logs</h1>
        <p className="text-neutral-500 mt-1 text-sm font-light">Inspect real-time operations activity streams, updates, and audit triggers.</p>
      </div>

      <DocTabs />

      {/* Priority Updates Section */}
      {store.updates.length > 0 && (
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <h3 className="text-lg font-bold text-black font-serif">Critical Operations Alert</h3>
          </div>
          
          <div className="border border-red-200 rounded-3xl p-6 relative bg-white shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-red-500 text-white text-[9px] font-black tracking-widest px-2 py-1 rounded uppercase">
                Urgent
              </span>
            </div>
            
            <div className="flex-1 space-y-1">
              <p className="text-red-500 text-[10px] font-black tracking-widest uppercase">CRITICAL SYSTEM DIRECTIVE</p>
              <h2 className="text-xl font-bold text-black font-serif">{store.updates[0].title}</h2>
              <p className="text-neutral-500 text-xs font-light max-w-2xl leading-relaxed">
                {store.updates[0].description} Compliance checks and audit operations must be validated immediately to safeguard system parity.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0">
              <button 
                onClick={() => handleDismiss(store.updates[0].id)}
                className="px-4 py-2 border border-black/10 text-neutral-600 bg-white hover:bg-neutral-50 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xs transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={() => showToast("Reviewing changes context triggered...")}
                className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors"
              >
                Validate Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Notifications Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-black font-serif">Real-time Stream Updates</h3>
          <span className="text-neutral-400 text-xs font-mono">{store.updates.length} items logged</span>
        </div>

        {store.updates.length === 0 ? (
          <div className="bg-white border border-black/10 rounded-3xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 border border-black/5">
              <Bell className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-lg font-bold text-black mb-1 font-serif">No Operations Logged</h3>
            <p className="text-neutral-500 max-w-xs text-xs font-light">Operations updates stream is clear. Any new file actions will prompt alerts here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {store.updates.map((update) => (
              <div 
                key={update.id} 
                className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs flex flex-col hover:border-black/30 transition-all group relative"
              >
                <button 
                  onClick={() => handleDismiss(update.id)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3 mb-4 pr-6">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 border border-black/5 text-black">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-sm">{update.title}</h4>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{update.timestamp}</p>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 font-light leading-relaxed mb-6 flex-1">
                  {update.description}
                </p>

                <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide border ${
                    update.priority === "Critical" ? "bg-red-50 border-red-200 text-red-700 animate-pulse" :
                    update.priority === "High" ? "bg-orange-50 border-orange-200 text-orange-700" :
                    "bg-neutral-50 border-neutral-200 text-neutral-600"
                  }`}>
                    {update.priority} Priority
                  </span>
                  
                  <button 
                    onClick={() => showToast(`Triggered detail log for update ${update.id}`)}
                    className="text-[10px] font-black text-black uppercase tracking-widest hover:underline"
                  >
                    View Alert Log
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Undo Snackbar ── */}
      <AnimatePresence>
        {undoToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-6 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-xs font-bold text-neutral-300">Alert dismissed. Saved to backend logs.</span>
            </div>
            <button 
              onClick={handleUndo}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 font-black text-xs uppercase tracking-widest border-l border-white/10 pl-6 shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast Msg ── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-white/10"
          >
            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-wide">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
