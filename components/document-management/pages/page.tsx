"use client";

import React, { useState, useEffect, useRef } from "react";
import { DocTabs } from "@/components/document-management/DocTabs";
import { 
  FileText, ShieldAlert, ArrowRight, Download, MoreVertical,
  UploadCloud, Archive, Clock, Search, Filter, CheckCircle, 
  ShieldCheck, FilePlus, ChevronLeft, Calendar, User, AlignLeft,
  X, Check, RefreshCw, Send, Undo2, Users, FileCode, Paperclip
} from "lucide-react";
import { useDocumentStore, DocumentWithExtra, ActivityLog } from "@/lib/useDocumentStore";
import { documentApi } from "@/lib/document-api";
import { DocumentTable, StatCard, StatusBadge } from "@/components/document-management";
import { motion, AnimatePresence } from "framer-motion";

export default function DocumentOverviewPage() {
  const store = useDocumentStore();
  const [role, setRole] = useState<string>("Owner");

  // Nav views state
  const [viewMode, setViewMode] = useState<"dashboard" | "table">("dashboard");
  const [activeToast, setActiveToast] = useState("");
  const [undoToast, setUndoToast] = useState(false);

  // Active filters clicked from Quick Access cards
  const [cardStatusFilter, setCardStatusFilter] = useState<string | undefined>(undefined);
  const [cardSharedFilter, setCardSharedFilter] = useState<boolean | undefined>(undefined);

  // Alert State
  const [showPriorityAlert, setShowPriorityAlert] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [name: string]: number }>({});
  const [uploadComplete, setUploadComplete] = useState<{ [name: string]: boolean }>({});
  
  // Upload Fields State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadDept, setUploadDept] = useState("General");
  const [uploadAccess, setUploadAccess] = useState<any>("Organization Wide");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadReviewer, setUploadReviewer] = useState("Manager Reviewer");

  // Create Document State (Rich Editor)
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorDesc, setEditorDesc] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorDept, setEditorDept] = useState("General");
  const [editorAccess, setEditorAccess] = useState<any>("Private");
  const [editorTags, setEditorTags] = useState("");
  const [editorCollaborators, setEditorCollaborators] = useState<string[]>([]);
  const [editorAttachments, setEditorAttachments] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState("Saved as Draft");
  const [activeTemplate, setActiveTemplate] = useState("blank");

  // Template Data
  const templates = {
    blank: {
      title: "Untitled Document",
      desc: "Fresh canvas.",
      content: "Start writing here...\n\n"
    },
    sop: {
      title: "Standard SOP: [Insert Operation Name]",
      desc: "Standard Operating Procedure template.",
      content: "STANDARD OPERATING PROCEDURE\n============================\n\n1. PURPOSE & OBJECTIVE\nThis document details the exact protocols for property operations.\n\n2. MANDATORY CHECKLIST\n- Ensure guest verification\n- Confirm safety checks are signed\n- File digital receipts\n\n3. AUDIT SCHEDULE\nThis procedure will be audited quarterly."
    },
    brief: {
      title: "Project Alpha Tech Specs",
      desc: "Detailed technical brief outline.",
      content: "PROJECT BRIEF AND SPECIFICATIONS\n===============================\n\n1. EXECUTIVE SUMMARY\nOverview of the strategic implementation plans.\n\n2. TIMELINE & MILESTONES\n- Phase 1: Prototype Launch (Q3)\n- Phase 2: Operations Test (Q4)\n- Phase 3: Rollout (2027)\n\n3. REVENUE FORECAST\nEstimates show 15% efficiency increase."
    }
  };

  useEffect(() => {
    const ROLE_DISPLAY: Record<string, string> = {
      owner: "Owner", manager: "Manager", staff: "Staff", superadmin: "Super Admin",
    };
    const stored = localStorage.getItem("skitech_role");
    if (stored) setRole(ROLE_DISPLAY[stored.toLowerCase()] ?? stored);
  }, []);

  const showToastMsg = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(""), 3000);
  };

  // Helper: Trigger alert dismissal with Undo toast
  const handleAlertDismiss = () => {
    setShowPriorityAlert(false);
    store.addLog("DISMISS", "Current User", "Compliance Audit Expiring Soon", "Dismissed priority dashboard notification.");
    setUndoToast(true);
    setTimeout(() => setUndoToast(false), 5000);
  };

  const handleAlertUndo = () => {
    setShowPriorityAlert(true);
    setUndoToast(false);
    store.addLog("UNDO_DISMISS", "Current User", "Compliance Audit Expiring Soon", "Restored priority dashboard notification.");
    showToastMsg("Alert restored successfully.");
  };

  // Editor textarea ref for formatting
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (format: string) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end   = textarea.selectionEnd;
    const selected = editorContent.substring(start, end);
    const before  = editorContent.substring(0, start);
    const after   = editorContent.substring(end);

    let replacement = "";
    switch (format) {
      case "bold":      replacement = `**${selected || "bold text"}**`; break;
      case "italic":    replacement = `*${selected || "italic text"}*`; break;
      case "underline": replacement = `<u>${selected || "underlined text"}</u>`; break;
      case "h1":        replacement = `\n# ${selected || "Heading 1"}\n`; break;
      case "h2":        replacement = `\n## ${selected || "Heading 2"}\n`; break;
      case "list":      replacement = `\n- ${selected || "List item"}\n`; break;
      case "quote":     replacement = `\n> ${selected || "Blockquote"}\n`; break;
      default: return;
    }

    const newContent = before + replacement + after;
    setEditorContent(newContent);
    setTimeout(() => {
      textarea.focus();
      const pos = start + replacement.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  // File Upload Handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      processSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processSelectedFiles(files);
    }
  };

  const processSelectedFiles = (files: File[]) => {
    // Validate Allowed Formats: PDF, DOCX, XLSX, PNG, JPG
    const allowed = ["pdf", "docx", "xlsx", "png", "jpg", "jpeg"];
    const valid = files.filter(f => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return allowed.includes(ext);
    });

    if (valid.length < files.length) {
      alert("Invalid files omitted. Allowed formats: PDF, DOCX, XLSX, PNG, JPG");
    }

    setSelectedFiles(prev => [...prev, ...valid]);

    // Pre-fill Title if empty
    if (valid.length > 0 && !uploadTitle) {
      setUploadTitle(valid[0].name.split(".")[0]);
    }

    // Trigger simulated upload progress
    valid.forEach(f => {
      setUploadProgress(prev => ({ ...prev, [f.name]: 0 }));
      setUploadComplete(prev => ({ ...prev, [f.name]: false }));
      
      let p = 0;
      const interval = setInterval(() => {
        p += 25;
        setUploadProgress(prev => ({ ...prev, [f.name]: p }));
        if (p >= 100) {
          clearInterval(interval);
          setUploadComplete(prev => ({ ...prev, [f.name]: true }));
        }
      }, 300);
    });
  };

  const executeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select or drop a file to upload.");
      return;
    }

    const firstFile = selectedFiles[0];
    const fileExt = firstFile.name.split(".").pop()?.toUpperCase() as any;

    const mockFormData = new FormData();
    mockFormData.append("name",            uploadTitle);
    mockFormData.append("description",     uploadDesc);
    mockFormData.append("category",        uploadDept);
    mockFormData.append("uploadedBy",      "Current User");
    mockFormData.append("fileType",        fileExt || "PDF");
    mockFormData.append("visibility",      uploadAccess);
    mockFormData.append("tags",            uploadTags);
    mockFormData.append("assignedReviewer", uploadReviewer);
    mockFormData.append("status",          "Pending Approval");
    // Include actual file so backend can store it
    mockFormData.append("file",            firstFile, firstFile.name);

    try {
      await documentApi.uploadDocument(mockFormData, role);
      
      // Update core store
      store.addDocument({
        name: uploadTitle,
        description: uploadDesc,
        category: uploadDept,
        department: uploadDept,
        tags: uploadTags.split(",").map(t => t.trim()).filter(Boolean),
        visibility: uploadAccess,
        owner: "Current User",
        uploadedBy: "Current User",
        status: "Pending Approval",
        fileType: fileExt || "PDF",
        fileSize: `${(firstFile.size / (1024 * 1024)).toFixed(1)} MB` || "1.2 MB",
        isShared: uploadAccess !== "Private",
        content: "File preview is securely sandboxed."
      });

      // Clear State
      setSelectedFiles([]);
      setUploadTitle("");
      setUploadDesc("");
      setUploadTags("");
      setShowUploadModal(false);
      
      showToastMsg(`Successfully uploaded document: ${uploadTitle}`);
    } catch (err: any) {
      alert(err.message || "Failed to upload.");
    }
  };

  // Editor Templates trigger
  const applyTemplate = (key: keyof typeof templates) => {
    setActiveTemplate(key);
    setEditorTitle(templates[key].title);
    setEditorDesc(templates[key].desc);
    setEditorContent(templates[key].content);
    showToastMsg(`Template applied: ${key.toUpperCase()}`);
  };

  // Simulating auto-saving draft in background
  useEffect(() => {
    if (!showEditorModal) return;
    const saveTimer = setInterval(() => {
      setAutoSaveStatus("Auto-saving draft...");
      setTimeout(() => setAutoSaveStatus("Draft Auto-Saved"), 800);
    }, 15000);
    return () => clearInterval(saveTimer);
  }, [showEditorModal]);

  const executeCreateDocument = async (publish: boolean) => {
    if (!editorTitle.trim()) {
      alert("Please enter a document title.");
      return;
    }

    const payload = {
      name: editorTitle,
      description: editorDesc,
      category: editorDept,
      department: editorDept,
      tags: editorTags.split(",").map(t => t.trim()).filter(Boolean),
      visibility: editorAccess,
      uploadedBy: "Current User",
      status: publish ? ("Active" as const) : ("Draft" as const),
      content: editorContent,
      collaborators: editorCollaborators,
      fileSize: `${(editorContent.length / 1024).toFixed(1)} KB`
    };

    try {
      await documentApi.createDocument(payload, role);
      
      // Update core store
      store.addDocument({
        name: editorTitle,
        description: editorDesc,
        category: editorDept,
        department: editorDept,
        tags: payload.tags,
        visibility: editorAccess,
        owner: "Current User",
        uploadedBy: "Current User",
        status: publish ? "Active" : "Draft",
        fileType: "DOCX",
        fileSize: payload.fileSize,
        isShared: editorAccess !== "Private",
        content: editorContent,
        collaborators: editorCollaborators
      });

      // Clear State
      setEditorTitle("");
      setEditorDesc("");
      setEditorContent("");
      setEditorTags([]);
      setEditorCollaborators([]);
      setShowEditorModal(false);

      showToastMsg(`Platform file created: ${editorTitle}`);
    } catch (err: any) {
      alert(err.message || "Failed to create document.");
    }
  };

  // Click handler for Quick Access analytics stats cards
  const handleCardClick = (type: "total" | "pending" | "approved" | "rejected" | "recent" | "shared") => {
    // Reset filters
    setCardStatusFilter(undefined);
    setCardSharedFilter(undefined);

    if (type === "pending") {
      setCardStatusFilter("Pending Approval");
    } else if (type === "approved") {
      setCardStatusFilter("Active");
    } else if (type === "rejected") {
      setCardStatusFilter("Rejected");
    } else if (type === "shared") {
      setCardSharedFilter(true);
    }
    
    setViewMode("table");
    showToastMsg(`Displaying filtered results for: ${type.toUpperCase()}`);
  };

  // Calculations for Stat Counts
  const totalDocsCount = store.documents.length;
  const pendingDocsCount = store.documents.filter(d => d.status === "Pending Approval").length;
  const approvedDocsCount = store.documents.filter(d => d.status === "Active" || d.status === "Secure").length;
  const rejectedDocsCount = store.documents.filter(d => d.status === "Rejected").length;
  const sharedDocsCount = store.documents.filter(d => d.isShared).length;

  return (
    <div className="space-y-6 pb-20 font-[family-name:var(--font-merriweather)]">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight font-serif">Document Management</h1>
          <p className="text-neutral-500 mt-1 text-sm font-light">Index, securely store, review, and collaborate on operational data files.</p>
        </div>
        
        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          {viewMode === "table" && (
            <button 
              onClick={() => setViewMode("dashboard")}
              className="flex items-center gap-2 border border-black/15 bg-white text-black px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Dashboard Overview
            </button>
          )}

          {/* Create Button (Owner / Manager has full access, Staff limited) */}
          <button 
            onClick={() => setShowEditorModal(true)}
            className="flex items-center gap-2 bg-white text-black border border-black/15 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-neutral-50 transition-all hover:scale-102"
          >
            <FilePlus className="w-4 h-4" />
            Create Document
          </button>

          {/* Upload Button */}
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-black/15 hover:bg-neutral-800 transition-all hover:scale-102"
          >
            <UploadCloud className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      <DocTabs />

      {/* ── Priority Banner Alert (Dismiss action with Undo snackbar) ── */}
      <AnimatePresence>
        {role === "Owner" && showPriorityAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="bg-white rounded-3xl p-6 border-l-4 border-red-500 shadow-md flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Priority compliance</span>
                  <span className="text-neutral-400 text-xs">Awaiting Signature</span>
                </div>
                <h3 className="text-lg font-bold text-black font-serif">Q2 Operations Compliance Audit</h3>
                <p className="text-neutral-500 mt-1 text-xs font-light">The mandatory operations checklist requires Owner validation and electronic signature before expiration today.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={handleAlertDismiss}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Dismiss
              </button>
              
              <button 
                onClick={() => {
                  const targetDoc = store.documents.find(d => d.id === "doc-5");
                  if (targetDoc) {
                    store.reviewDocument(targetDoc.id, "Current User", "Approved", "Pre-approved on critical landing board.");
                    showToastMsg("Audit changes successfully signed and archived.");
                    setShowPriorityAlert(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                Sign Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN WORKSPACE PANEL ── */}
      {viewMode === "dashboard" ? (
        /* ================== DASHBOARD VIEW ================== */
        <div className="space-y-8">
          
          {/* Clickable Quick Access Stats Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard 
              icon={FileText} 
              label="Total Files" 
              value={totalDocsCount} 
              onClick={() => handleCardClick("total")} 
            />
            <StatCard 
              icon={Clock} 
              label="Pending Reviews" 
              value={pendingDocsCount} 
              alert={pendingDocsCount > 0}
              onClick={() => handleCardClick("pending")} 
            />
            <StatCard 
              icon={ShieldCheck} 
              label="Approved Docs" 
              value={approvedDocsCount} 
              onClick={() => handleCardClick("approved")} 
            />
            <StatCard 
              icon={ShieldAlert} 
              label="Rejected Docs" 
              value={rejectedDocsCount} 
              onClick={() => handleCardClick("rejected")} 
            />
            <StatCard 
              icon={UploadCloud} 
              label="Recent Uploads" 
              value={store.documents.slice(0, 3).length} 
              onClick={() => handleCardClick("recent")} 
            />
            <StatCard 
              icon={Users} 
              label="Shared Files" 
              value={sharedDocsCount} 
              onClick={() => handleCardClick("shared")} 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Quick Access List */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-black font-serif">Quick Access Workspace</h3>
                <button 
                  onClick={() => setViewMode("table")}
                  className="text-xs font-bold text-neutral-500 hover:text-black flex items-center gap-1 uppercase tracking-widest"
                >
                  View All Files <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.documents.slice(0, 4).map(doc => (
                  <motion.div 
                    key={doc.id}
                    whileHover={{ y: -3 }}
                    onClick={() => { setViewMode("table"); }}
                    className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-neutral-50 border border-black/5 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-black" />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{doc.fileSize}</span>
                    </div>
                    
                    <h4 className="font-bold text-black mb-1 truncate group-hover:text-neutral-600">{doc.name}</h4>
                    <p className="text-xs text-neutral-400 mb-4">{doc.category} • Updated {doc.lastModified}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Uploader: {doc.uploadedBy || doc.owner}</span>
                      <StatusBadge status={doc.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Updates / Activity Logs Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-black font-serif">Operations Audit Trail</h3>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">System Log</span>
              </div>
              
              <div className="bg-white rounded-3xl border border-black/10 shadow-sm overflow-hidden p-5 space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar">
                {store.activityLogs.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic text-center py-8">No activity logged.</p>
                ) : (
                  store.activityLogs.map((log) => (
                    <div key={log.id} className="text-xs border-b border-black/5 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          log.action === "UPLOAD" ? "bg-green-50 text-green-700" :
                          log.action === "REVIEW" ? "bg-blue-50 text-blue-700" :
                          log.action === "DELETE" ? "bg-red-50 text-red-700" :
                          "bg-neutral-50 text-neutral-700"
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-neutral-400 font-mono text-[10px]">{log.timestamp}</span>
                      </div>
                      <p className="font-medium text-black">
                        {log.actor} <span className="font-light text-neutral-500">performed operations on</span> {log.documentName}
                      </p>
                      {log.details && (
                        <p className="text-[11px] text-neutral-400 font-light mt-1 bg-neutral-50 p-2 rounded-lg italic">
                          "{log.details}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ================== ALL DOCUMENTS TABLE VIEW ================== */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-black font-serif">Comprehensive Document Database</h3>
            <button 
              onClick={() => {
                setCardStatusFilter(undefined);
                setCardSharedFilter(undefined);
                setViewMode("dashboard");
              }}
              className="text-xs font-bold text-neutral-400 hover:text-black uppercase tracking-widest"
            >
              Back to Overview
            </button>
          </div>
          
          <DocumentTable 
            role={role}
            statusFilter={cardStatusFilter}
            sharedOnly={cardSharedFilter}
          />
        </div>
      )}

      {/* ── Dismiss Undo Action Snackbar ── */}
      <AnimatePresence>
        {undoToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-6 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-xs font-bold text-neutral-300">Alert dismissed. Operations logged in audit.</span>
            </div>
            <button 
              onClick={handleAlertUndo}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 font-black text-xs uppercase tracking-widest border-l border-white/10 pl-6 shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success Toast Alert ── */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-white/10"
          >
            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-bold text-sm tracking-wide">{activeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── UPLOAD DOCUMENT MODAL (Drag & Drop, Previews, Progress Bars) ── */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#faf9f6] rounded-3xl w-full max-w-2xl border border-black/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/10 bg-white flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-black font-serif">Upload Operational Records</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Secure, sandboxed index upload for department verification.</p>
                </div>
                <button onClick={() => { setShowUploadModal(false); setSelectedFiles([]); }} className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={executeUpload} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-semibold text-black">
                
                {/* Drag and Drop Zone */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging 
                      ? "border-black bg-neutral-100 scale-98" 
                      : "border-black/15 bg-white hover:border-black/30 hover:bg-neutral-50/50"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple 
                    className="hidden"
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  />
                  <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
                  <p className="text-sm font-bold text-black">Drag and drop file here, or click to browse</p>
                  <p className="text-neutral-400 font-light mt-1">Allowed formats: PDF, DOCX, XLSX, PNG, JPG (Max 50MB)</p>
                </div>

                {/* Selected Files & Progress Bars */}
                {selectedFiles.length > 0 && (
                  <div className="bg-white border border-black/10 rounded-2xl p-4 space-y-3 shadow-xs">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Selected Files & Stream Logs</h4>
                    {selectedFiles.map((file) => {
                      const progress = uploadProgress[file.name] || 0;
                      const done = uploadComplete[file.name] || false;
                      return (
                        <div key={file.name} className="flex items-center justify-between gap-4 p-2 border border-black/5 rounded-xl bg-neutral-50/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                            <span className="font-bold text-black truncate max-w-xs">{file.name}</span>
                          </div>
                          
                          <div className="flex-1 max-w-xs space-y-1">
                            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                              <div className="h-full bg-black rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                              <span>{progress}%</span>
                              <span>{done ? "Secure landing successful" : "Streaming..."}</span>
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => setSelectedFiles(prev => prev.filter(f => f.name !== file.name))}
                            className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-black shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Title & Desc */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Document Title</label>
                    <input 
                      type="text" 
                      required 
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Q4 Growth Index"
                      className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Category / Department</label>
                    <select 
                      value={uploadDept}
                      onChange={(e) => setUploadDept(e.target.value)}
                      className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none cursor-pointer"
                    >
                      {["Finance", "Human Resources", "Engineering", "Marketing", "Legal", "General"].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Document Description</label>
                  <textarea 
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="Enter short contextual overview..."
                    rows={2}
                    className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Access Scope</label>
                    <select 
                      value={uploadAccess}
                      onChange={(e) => setUploadAccess(e.target.value as any)}
                      className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none cursor-pointer"
                    >
                      {["Organization Wide", "Team Only", "Department", "Private"].map(access => (
                        <option key={access} value={access}>{access}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Assigned Compliance Reviewer</label>
                    <select 
                      value={uploadReviewer}
                      onChange={(e) => setUploadReviewer(e.target.value)}
                      className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none cursor-pointer"
                    >
                      {["Manager Reviewer", "Jane Doe", "Property Owner Review"].map(rev => (
                        <option key={rev} value={rev}>{rev}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Tags (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="e.g. checklist, audit, q4"
                    className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                {/* Actions Footer */}
                <div className="flex justify-end gap-3 pt-6 border-t border-black/10 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => { setShowUploadModal(false); setSelectedFiles([]); }}
                    className="px-5 py-2.5 text-xs font-bold text-neutral-500 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors"
                  >
                    Commit Secure Upload
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATE DOCUMENT WORKSPACE MODAL (Rich Text Editor, Autosaver, Versions) ── */}
      <AnimatePresence>
        {showEditorModal && (
          <div className="fixed inset-0 z-50 bg-[#141414] text-white flex flex-col overflow-hidden font-sans">
            
            {/* Editor Topbar */}
            <div className="h-16 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-600/10 border border-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Platform Editor Command Center</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 block font-mono">WORKSPACE SANDBOX</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-green-400 font-mono uppercase tracking-wider">{autoSaveStatus}</span>
                  </div>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-4 text-xs font-bold">
                {/* Template Selection Widget */}
                <div className="flex bg-[#262626] border border-white/5 rounded-xl p-1 shrink-0">
                  <button 
                    onClick={() => applyTemplate("blank")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTemplate === "blank" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"}`}
                  >
                    Blank Brief
                  </button>
                  <button 
                    onClick={() => applyTemplate("sop")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTemplate === "sop" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"}`}
                  >
                    Standard SOP
                  </button>
                  <button 
                    onClick={() => applyTemplate("brief")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTemplate === "brief" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"}`}
                  >
                    Tech Specs
                  </button>
                </div>

                <div className="w-[1px] h-6 bg-white/10" />

                <button 
                  onClick={() => executeCreateDocument(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 text-white transition-colors"
                >
                  Save as Draft
                </button>

                <button 
                  onClick={() => executeCreateDocument(true)}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors"
                >
                  Publish Document
                </button>

                <button 
                  onClick={() => setShowEditorModal(false)}
                  className="p-2 bg-white/5 hover:bg-red-600 rounded-xl text-neutral-400 hover:text-white transition-all"
                  title="Close Workspace"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Workspace Split View */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Rich Composition Canvas */}
              <div className="flex-1 overflow-y-auto bg-[#0d0d0d] p-10 flex justify-center">
                <div className="max-w-3xl w-full flex flex-col gap-6 font-serif">
                  
                  {/* Document Title input */}
                  <input 
                    type="text" 
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Document Title (e.g. Operational SOP V1)"
                    className="bg-transparent border-0 border-b border-white/5 focus:border-white/20 pb-4 text-3xl font-black focus:outline-none font-serif text-white tracking-tight w-full"
                  />

                  {/* Formatting helper bar */}
                  <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2 border border-white/5 text-xs text-neutral-400 shrink-0 font-sans">
                    <button type="button" onClick={() => applyFormat("bold")} className="p-1 hover:text-white transition-colors" title="Bold (**text**)"><b>B</b></button>
                    <button type="button" onClick={() => applyFormat("italic")} className="p-1 hover:text-white transition-colors" title="Italic (*text*)"><i>I</i></button>
                    <button type="button" onClick={() => applyFormat("underline")} className="p-1 hover:text-white transition-colors" title="Underline"><span className="underline">U</span></button>
                    <div className="w-[1px] h-4 bg-white/10 mx-2" />
                    <button type="button" onClick={() => applyFormat("h1")} className="p-1 hover:text-white transition-colors" title="Heading 1 (# text)">H1</button>
                    <button type="button" onClick={() => applyFormat("h2")} className="p-1 hover:text-white transition-colors" title="Heading 2 (## text)">H2</button>
                    <div className="w-[1px] h-4 bg-white/10 mx-2" />
                    <button type="button" onClick={() => applyFormat("list")} className="p-1 hover:text-white transition-colors" title="Bullet list (- item)">List</button>
                    <button type="button" onClick={() => applyFormat("quote")} className="p-1 hover:text-white transition-colors" title="Blockquote (&gt; text)">Quote</button>
                  </div>

                  {/* Document Summary input */}
                  <input 
                    type="text" 
                    value={editorDesc}
                    onChange={(e) => setEditorDesc(e.target.value)}
                    placeholder="Short description / abstract..."
                    className="bg-transparent border-0 text-sm font-sans focus:outline-none text-neutral-400 font-light w-full"
                  />

                  {/* Core Composition Content */}
                  <textarea
                    ref={editorTextareaRef}
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Start composition here..."
                    className="bg-transparent border-0 focus:outline-none flex-1 text-base text-neutral-200 leading-relaxed font-sans placeholder-neutral-700 resize-none min-h-[400px] w-full"
                  />

                </div>
              </div>

              {/* Document Indexing Sidebar */}
              <div className="w-[340px] bg-[#1a1a1a] border-l border-white/10 overflow-y-auto p-6 flex flex-col gap-6 font-sans text-xs shrink-0">
                
                <div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Document Index Settings</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Department Link</label>
                      <select 
                        value={editorDept} 
                        onChange={(e) => setEditorDept(e.target.value)}
                        className="w-full p-3 bg-[#262626] border border-white/5 rounded-xl text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        {["Finance", "Human Resources", "Engineering", "Marketing", "Legal", "General"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Access Level Scope</label>
                      <select 
                        value={editorAccess} 
                        onChange={(e) => setEditorAccess(e.target.value as any)}
                        className="w-full p-3 bg-[#262626] border border-white/5 rounded-xl text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        {["Organization Wide", "Team Only", "Department", "Private"].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Compliance Indexing Tags</label>
                      <input 
                        type="text" 
                        value={editorTags}
                        onChange={(e) => setEditorTags(e.target.value)}
                        placeholder="e.g. internal, draft, template"
                        className="w-full p-3 bg-[#262626] border border-white/5 rounded-xl text-neutral-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Collaborators */}
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-neutral-400" />
                    Team Collaborators
                  </h4>
                  <div className="space-y-2 bg-[#262626] p-3 rounded-2xl border border-white/5 text-neutral-300">
                    {["Jane Doe", "Sarah Williams", "Corporate Legal Review"].map(user => {
                      const isSelected = editorCollaborators.includes(user);
                      return (
                        <label key={user} className="flex items-center gap-2 cursor-pointer py-1 font-medium">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {
                              setEditorCollaborators(prev => isSelected ? prev.filter(u => u !== user) : [...prev, user]);
                            }}
                            className="rounded border-white/10 bg-transparent text-white focus:ring-white/20"
                          />
                          {user}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Attach Media files */}
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-neutral-400" />
                    Attached Media files
                  </h4>
                  <div className="border border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 cursor-pointer">
                    <Paperclip className="w-6 h-6 text-neutral-500 mb-2" />
                    <span className="text-[10px] text-neutral-400">Click to link auxiliary assets</span>
                  </div>
                </div>

                {/* Version History preview */}
                <div className="mt-auto border-t border-white/10 pt-4 text-neutral-500">
                  <span className="block text-[10px] uppercase font-mono tracking-wider">Editor Version Audit</span>
                  <span className="font-bold text-neutral-400 block mt-1">v1.0 (Live composition)</span>
                </div>

              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ── MODERN ANALYTICS STAT CARD COMPONENT ──

