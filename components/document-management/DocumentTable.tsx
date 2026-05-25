"use client";

import React, { useState, useEffect } from "react";
import { 
  MoreVertical, File, ChevronDown, List, LayoutGrid, Search, 
  UploadCloud, Pin, Image as ImageIcon, FileText, FileCode,
  Filter, RotateCcw, X, Eye, Download, Info, Check, ShieldAlert,
  Calendar, Layers, ShieldCheck, Tag, ZoomIn, ZoomOut, Maximize2, Trash2, Edit3, ArrowRightLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentWithExtra, useDocumentStore, ReviewHistoryEntry } from "@/lib/useDocumentStore";
import { documentApi } from "@/lib/document-api";
import { StatusBadge } from "@/components/document-management/SharedComponents";

interface DocumentTableProps {
  documents?: DocumentWithExtra[];
  role?: string;
  categoryFilter?: string;
  statusFilter?: string;
  myDocsOnly?: boolean;
  sharedOnly?: boolean;
}

export function DocumentTable({ 
  documents: propDocuments, 
  role: propRole,
  categoryFilter,
  statusFilter,
  myDocsOnly,
  sharedOnly
}: DocumentTableProps) {
  const store = useDocumentStore();
  const [role, setRole] = useState<string>("Owner");

  // Local state for layout and interactions
  const [view, setView] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Multi-select filters state
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterDepts, setFilterDepts] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterAccess, setFilterAccess] = useState<string[]>([]);

  // Detailed Modal/Drawer state
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithExtra | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // File Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentWithExtra | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreviewSidebar, setShowPreviewSidebar] = useState(true);

  // Review Modal state
  const [reviewingDoc, setReviewingDoc] = useState<DocumentWithExtra | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Edit Modal state
  const [editingDoc, setEditingDoc] = useState<DocumentWithExtra | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editAccess, setEditAccess] = useState<any>("Organization Wide");

  useEffect(() => {
    const stored = localStorage.getItem("skitech_role");
    if (stored) {
      setRole(stored);
    } else if (propRole) {
      setRole(propRole);
    }
  }, [propRole]);

  // Use props if supplied, else use client-side live store
  const sourceDocs = propDocuments || store.documents;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Helper: File icon generator
  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="w-5 h-5 text-red-500" />;
      case "DOCX": return <FileText className="w-5 h-5 text-blue-500" />;
      case "XLSX": return <FileCode className="w-5 h-5 text-green-500" />;
      case "PNG":
      case "JPG": return <ImageIcon className="w-5 h-5 text-purple-500" />;
      default: return <File className="w-5 h-5 text-neutral-500" />;
    }
  };

  // Apply filters in sequence
  let processedDocs = [...sourceDocs];

  // Apply wrapper page filters
  if (categoryFilter) {
    processedDocs = processedDocs.filter(d => d.category === categoryFilter || d.department === categoryFilter);
  }
  if (statusFilter) {
    processedDocs = processedDocs.filter(d => d.status === statusFilter);
  }
  if (myDocsOnly) {
    processedDocs = processedDocs.filter(d => d.owner === "Current User" || d.uploadedBy === "Current User");
  }
  if (sharedOnly) {
    processedDocs = processedDocs.filter(d => d.isShared);
  }

  // Apply real-time query search
  if (search) {
    processedDocs = processedDocs.filter(doc => 
      doc.name.toLowerCase().includes(search.toLowerCase()) || 
      doc.description.toLowerCase().includes(search.toLowerCase()) ||
      doc.owner.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply multi-select filters
  if (filterTypes.length > 0) {
    processedDocs = processedDocs.filter(d => filterTypes.includes(d.fileType));
  }
  if (filterDepts.length > 0) {
    processedDocs = processedDocs.filter(d => filterDepts.includes(d.department));
  }
  if (filterStatuses.length > 0) {
    processedDocs = processedDocs.filter(d => filterStatuses.includes(d.status));
  }
  if (filterAccess.length > 0) {
    processedDocs = processedDocs.filter(d => filterAccess.includes(d.visibility));
  }

  // Apply Sorting
  processedDocs.sort((a, b) => {
    if (sortBy === "newest") return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    if (sortBy === "oldest") return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
    if (sortBy === "alpha") return a.name.localeCompare(b.name);
    if (sortBy === "alpha-desc") return b.name.localeCompare(a.name);
    if (sortBy === "size") {
      const getBytes = (sz: string) => {
        const val = parseFloat(sz);
        if (sz.includes("MB")) return val * 1024 * 1024;
        return val * 1024;
      };
      return getBytes(b.fileSize) - getBytes(a.fileSize);
    }
    return 0;
  });

  // Calculate dynamic pagination
  const totalItems = processedDocs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const adjustedCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (adjustedCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedDocs = processedDocs.slice(startIndex, endIndex);

  const resetAllFilters = () => {
    setFilterTypes([]);
    setFilterDepts([]);
    setFilterStatuses([]);
    setFilterAccess([]);
    setSearch("");
    setSortBy("newest");
    setCurrentPage(1);
    showToast("Filters successfully reset");
  };

  // Actions handlers
  const handleDownload = (doc: DocumentWithExtra, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    store.addLog("DOWNLOAD", "Current User", doc.name, "Downloaded via file viewer.");
    showToast(`Downloading secure package: ${doc.name}...`);
  };

  const handleEditOpen = (doc: DocumentWithExtra, e: React.MouseEvent) => {
    e.stopPropagation();
    // Validate edit permissions
    const isOwnerOfDoc = doc.uploadedBy === "Current User" || doc.owner === "Current User";
    const hasEditPermission = role === "Owner" || role === "Manager" || isOwnerOfDoc;
    
    if (!hasEditPermission) {
      showToast("Access Denied: Staff accounts cannot edit files uploaded by others.");
      return;
    }

    setEditingDoc(doc);
    setEditTitle(doc.name);
    setEditDesc(doc.description);
    setEditDept(doc.department);
    setEditTags(doc.tags.join(", "));
    setEditAccess(doc.visibility);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    
    const parsedTags = editTags.split(",").map(t => t.trim()).filter(Boolean);
    store.updateDocument(editingDoc.id, {
      name: editTitle,
      description: editDesc,
      department: editDept,
      category: editDept,
      tags: parsedTags,
      visibility: editAccess,
      isShared: editAccess !== "Private"
    }, "Current User");

    setEditingDoc(null);
    showToast(`Document "${editTitle}" successfully updated.`);
    
    // Update currently viewed document details if open
    if (selectedDoc?.id === editingDoc.id) {
      setSelectedDoc({
        ...selectedDoc,
        name: editTitle,
        description: editDesc,
        department: editDept,
        category: editDept,
        tags: parsedTags,
        visibility: editAccess
      });
    }
  };

  const handleDelete = (doc: DocumentWithExtra, e: React.MouseEvent) => {
    e.stopPropagation();
    if (role !== "Owner") {
      showToast("Access Denied: Only property Owners can permanently delete files.");
      return;
    }

    if (confirm(`Are you sure you want to permanently delete "${doc.name}"?`)) {
      const nextDocs = store.documents.filter(d => d.id !== doc.id);
      localStorage.setItem("skitech_docs", JSON.stringify(nextDocs));
      store.addLog("DELETE", "Current User", doc.name, "Deleted document permanent audit.");
      showToast(`Document "${doc.name}" was permanently deleted.`);
      setShowDetails(false);
      setSelectedDoc(null);
      // Reload page state
      window.location.reload();
    }
  };

  const handleReviewSubmit = async (status: "Approved" | "Rejected") => {
    if (!reviewingDoc) return;
    if (reviewComment.trim().length < 5) {
      alert("Please add structured review feedback (min 5 characters).");
      return;
    }

    try {
      await documentApi.reviewDocument(
        reviewingDoc.id,
        "Current User",
        status,
        reviewComment,
        role
      );
      
      // Update in our core client state hook
      store.reviewDocument(reviewingDoc.id, "Current User", status, reviewComment);
      
      // Update local views
      const refreshedDocs = await documentApi.getDocuments(role);
      const target = refreshedDocs.find(d => d.id === reviewingDoc.id) || null;
      if (target) {
        setSelectedDoc(target);
      }

      setReviewingDoc(null);
      setShowReviewModal(false);
      setReviewComment("");
      showToast(`Document review completed: ${status}`);
    } catch (err: any) {
      alert(err.message || "Failed to process review.");
    }
  };

  return (
    <div className="font-[family-name:var(--font-merriweather)]">
      {/* ── Toolbar with Filters ── */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by title, owner, description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/15 bg-[#fcfbf9] transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Sorting Dropdown */}
            <div className="relative inline-flex items-center bg-[#fcfbf9] border border-black/10 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm text-black">
              <span className="text-neutral-400 text-xs mr-2 font-normal">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none pr-6 cursor-pointer font-bold text-xs uppercase tracking-wider"
              >
                <option value="newest">Newest Uploaded</option>
                <option value="oldest">Oldest Uploaded</option>
                <option value="alpha">A to Z</option>
                <option value="alpha-desc">Z to A</option>
                <option value="size">File Size</option>
              </select>
            </div>

            {/* View Switching */}
            <div className="flex bg-neutral-100 p-1 rounded-xl border border-black/5">
              <button 
                onClick={() => setView("list")}
                className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-white shadow-sm text-black" : "text-neutral-400 hover:text-black"}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-lg transition-all ${view === "grid" ? "bg-white shadow-sm text-black" : "text-neutral-400 hover:text-black"}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold tracking-widest uppercase shadow-sm transition-all ${
                showFilters || filterTypes.length > 0 || filterDepts.length > 0 || filterStatuses.length > 0 || filterAccess.length > 0
                  ? "bg-black text-white border-black" 
                  : "bg-white text-black border-black/15 hover:bg-neutral-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {(filterTypes.length + filterDepts.length + filterStatuses.length + filterAccess.length) > 0 && (
                <span className="ml-1 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shrink-0">
                  {filterTypes.length + filterDepts.length + filterStatuses.length + filterAccess.length}
                </span>
              )}
            </button>

            {/* Reset Button */}
            {(search || filterTypes.length > 0 || filterDepts.length > 0 || filterStatuses.length > 0 || filterAccess.length > 0) && (
              <button 
                onClick={resetAllFilters}
                className="p-2 border border-black/10 bg-white rounded-xl hover:bg-neutral-50 transition-colors shadow-sm text-neutral-600 hover:text-black"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Advanced Sticky Filters Grid ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-black/5 mt-4 pt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                
                {/* File Type Filter */}
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-neutral-400 mb-2">File Types</h4>
                  <div className="space-y-1.5 font-medium text-black">
                    {["PDF", "DOCX", "XLSX", "PNG", "JPG"].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filterTypes.includes(type)}
                          onChange={() => {
                            setFilterTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
                            setCurrentPage(1);
                          }}
                          className="rounded border-black/20 text-black focus:ring-black"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-neutral-400 mb-2">Departments</h4>
                  <div className="space-y-1.5 font-medium text-black">
                    {["Finance", "Human Resources", "Engineering", "Marketing", "Legal", "General"].map(dept => (
                      <label key={dept} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filterDepts.includes(dept)}
                          onChange={() => {
                            setFilterDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
                            setCurrentPage(1);
                          }}
                          className="rounded border-black/20 text-black focus:ring-black"
                        />
                        {dept}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-neutral-400 mb-2">Statuses</h4>
                  <div className="space-y-1.5 font-medium text-black">
                    {["Active", "Archived", "Draft", "Processing", "Urgent", "Pending Approval", "Rejected"].map(status => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filterStatuses.includes(status)}
                          onChange={() => {
                            setFilterStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
                            setCurrentPage(1);
                          }}
                          className="rounded border-black/20 text-black focus:ring-black"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Access Level Filter */}
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-neutral-400 mb-2">Access Levels</h4>
                  <div className="space-y-1.5 font-medium text-black">
                    {["Organization Wide", "Team Only", "Department", "Private"].map(access => (
                      <label key={access} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filterAccess.includes(access)}
                          onChange={() => {
                            setFilterAccess(prev => prev.includes(access) ? prev.filter(a => a !== access) : [...prev, access]);
                            setCurrentPage(1);
                          }}
                          className="rounded border-black/20 text-black focus:ring-black"
                        />
                        {access}
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Table/Grid Core Content ── */}
      <div className="bg-white border border-black/10 rounded-3xl shadow-sm overflow-hidden">
        {paginatedDocs.length === 0 ? (
          /* Empty State */
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#fcfbf9] border border-black/10 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-lg font-bold text-black mb-1">No Documents Found</h3>
            <p className="text-neutral-500 text-sm max-w-md">No records matched your search parameters. Try adjusting your checkboxes or typing something else.</p>
            <button 
              onClick={resetAllFilters} 
              className="mt-6 px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md hover:bg-neutral-800 transition-colors"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : view === "list" ? (
          /* List Mode Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-neutral-400 font-bold text-[10px] tracking-widest uppercase bg-[#fcfbf9]/50">
                  <th className="px-6 py-5">DOCUMENT NAME</th>
                  <th className="px-6 py-5">UPLOADED BY</th>
                  <th className="px-6 py-5">DEPARTMENT</th>
                  <th className="px-6 py-5">FILE TYPE</th>
                  <th className="px-6 py-5">UPLOAD DATE</th>
                  <th className="px-6 py-5">STATUS</th>
                  <th className="px-6 py-5">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {paginatedDocs.map((doc) => (
                  <tr 
                    key={doc.id} 
                    onClick={() => { setSelectedDoc(doc); setShowDetails(true); }}
                    className="hover:bg-neutral-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 border border-black/5 shadow-sm group-hover:scale-105 transition-transform">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <p className="font-bold text-black group-hover:text-neutral-600 transition-colors">{doc.name}</p>
                          <p className="text-neutral-400 text-xs mt-0.5">{doc.fileSize}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {doc.uploadedBy || doc.owner}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {doc.department}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-neutral-100 rounded text-neutral-600 text-xs font-bold font-mono">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-mono text-xs">
                      {doc.uploadDate}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setSelectedDoc(doc); setShowDetails(true); }}
                          className="px-3 py-1.5 border border-black/10 rounded-lg text-xs font-bold hover:bg-neutral-50 text-black shadow-sm shrink-0"
                        >
                          View Details
                        </button>
                        
                        <button 
                          onClick={() => { setPreviewDoc(doc); setShowPreview(true); }}
                          className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors shrink-0"
                          title="View File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={(e) => handleDownload(doc, e)}
                          className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors shrink-0"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <div className="relative group/menu shrink-0">
                          <button className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-black/10 rounded-xl shadow-xl hidden group-hover/menu:block z-50 p-1">
                            <button 
                              onClick={(e) => handleEditOpen(doc, e)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-black hover:bg-neutral-50 rounded-lg flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                              Edit Details
                            </button>
                            {(role === "Owner" || role === "Manager") && doc.status === "Pending Approval" && (
                              <button 
                                onClick={() => { setReviewingDoc(doc); setShowReviewModal(true); }}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Review Document
                              </button>
                            )}
                            {role === "Owner" && (
                              <button 
                                onClick={(e) => handleDelete(doc, e)}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 border-t border-black/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete File
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid Mode */
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-[#fbfbf9]/60">
            {paginatedDocs.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => { setSelectedDoc(doc); setShowDetails(true); }}
                className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 border border-black/5 group-hover:scale-105 transition-transform">
                    {getFileIcon(doc.fileType)}
                  </div>
                  
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => { setPreviewDoc(doc); setShowPreview(true); }}
                      className="p-1 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-50 transition-colors"
                      title="Quick Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDownload(doc, e)}
                      className="p-1 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-50 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-black mb-1 line-clamp-1 group-hover:text-neutral-600 transition-colors">{doc.name}</h4>
                <p className="text-xs text-neutral-400 mb-4 truncate">{doc.department} • {doc.fileSize}</p>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-6 font-light">{doc.description}</p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5 font-mono text-[10px]">
                  <StatusBadge status={doc.status} />
                  <span className="text-neutral-400 font-medium">
                    {doc.uploadDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination Footer ── */}
        <div className="p-5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-400 uppercase tracking-widest bg-white">
          <div className="flex items-center gap-4">
            <span>Showing {startIndex + 1} to {endIndex} of {totalItems} entries</span>
            
            {/* Items Per Page Selector */}
            <div className="flex items-center gap-1.5 font-bold text-black border border-black/10 rounded-lg px-2 py-1 bg-[#fcfbf9]">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-normal">Show:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent focus:outline-none cursor-pointer text-xs"
              >
                {[5, 10, 15, 20, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Page Numbers */}
          <div className="flex gap-1.5">
            <button 
              disabled={adjustedCurrentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 flex items-center justify-center border border-black/10 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button 
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  adjustedCurrentPage === pageNum 
                    ? "bg-black text-white shadow-md scale-105" 
                    : "border border-black/10 text-black hover:bg-neutral-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button 
              disabled={adjustedCurrentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-8 h-8 flex items-center justify-center border border-black/10 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ── Toast Alert Overlay ── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-white/10"
          >
            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-bold text-sm tracking-wide">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Document Details Sidebar Drawer ── */}
      <AnimatePresence>
        {showDetails && selectedDoc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#faf9f6] z-50 shadow-2xl border-l border-black/15 flex flex-col overflow-hidden text-neutral-800"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/10 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center border border-black/5">
                    {getFileIcon(selectedDoc.fileType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-base truncate max-w-xs">{selectedDoc.name}</h3>
                    <p className="text-neutral-400 text-xs">{selectedDoc.fileType} File • {selectedDoc.fileSize}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setPreviewDoc(selectedDoc); setShowPreview(true); }}
                    className="p-2 border border-black/10 rounded-xl hover:bg-neutral-50 text-black flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                  
                  <button 
                    onClick={() => handleDownload(selectedDoc)}
                    className="p-2 border border-black/10 rounded-xl hover:bg-neutral-50 text-black flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Get File
                  </button>

                  <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-black transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Status and Action banner for Managers/Owners */}
                {selectedDoc.status === "Pending Approval" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Awaiting Operations Review</h4>
                      <p className="text-xs text-amber-700 leading-relaxed font-light">This document is currently flagged for approval. Reviews can be executed by Owners or Managers.</p>
                      
                      {(role === "Owner" || role === "Manager") && (
                        <button 
                          onClick={() => { setReviewingDoc(selectedDoc); setShowReviewModal(true); }}
                          className="mt-3 bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-700 transition-colors"
                        >
                          Execute Review Action
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Document Metadata</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 font-light block mb-1">Status</span>
                      <StatusBadge status={selectedDoc.status} />
                    </div>
                    <div>
                      <span className="text-neutral-400 font-light block mb-1">Department / Category</span>
                      <span className="font-bold text-black flex items-center gap-1.5 mt-1">
                        <Layers className="w-3.5 h-3.5 text-neutral-400" />
                        {selectedDoc.department || selectedDoc.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-light block mb-1">Uploader / Owner</span>
                      <span className="font-bold text-black block mt-1">{selectedDoc.uploadedBy || selectedDoc.owner}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-light block mb-1">Visibility Scope</span>
                      <span className="font-bold text-black flex items-center gap-1.5 mt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                        {selectedDoc.visibility}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-light block mb-1">Upload Date</span>
                      <span className="font-bold text-black font-mono mt-1 block">{selectedDoc.uploadDate}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-light block mb-1">Last Modified</span>
                      <span className="font-bold text-black block mt-1">{selectedDoc.lastModified}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Description</h4>
                  <p className="text-sm font-light leading-relaxed text-neutral-700">{selectedDoc.description || "No description provided."}</p>
                </div>

                {/* Tags */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoc.tags && selectedDoc.tags.length > 0 ? (
                      selectedDoc.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-600 border border-neutral-200/50">
                          <Tag className="w-3 h-3 text-neutral-400" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-400 text-xs italic">No tags associated.</span>
                    )}
                  </div>
                </div>

                {/* Review/Approval History Timeline */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Review & Approval History</h4>
                  
                  {selectedDoc.reviewHistory && selectedDoc.reviewHistory.length > 0 ? (
                    <div className="relative pl-6 border-l border-black/10 space-y-6 text-xs">
                      {selectedDoc.reviewHistory.map((rev) => (
                        <div key={rev.id} className="relative">
                          {/* Dot */}
                          <span className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                            rev.status === "Approved" ? "bg-green-500" : rev.status === "Rejected" ? "bg-red-500" : "bg-amber-500"
                          }`} />
                          
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-black">{rev.reviewer}</span>
                            <span className="text-neutral-400 font-mono text-[10px]">{rev.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wide border ${
                              rev.status === "Approved" ? "bg-green-50 border-green-200 text-green-700" :
                              rev.status === "Rejected" ? "bg-red-50 border-red-200 text-red-700" :
                              "bg-amber-50 border-amber-200 text-amber-700"
                            }`}>
                              {rev.status}
                            </span>
                          </div>
                          <p className="text-neutral-600 font-light leading-relaxed bg-[#faf9f6] p-2.5 rounded-xl italic">
                            "{rev.comments || "No comments attached."}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-400 text-xs italic">No review trail registered yet.</p>
                  )}
                </div>

                {/* Version History */}
                {selectedDoc.versionHistory && selectedDoc.versionHistory.length > 0 && (
                  <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold tracking-widest text-neutral-400 uppercase font-serif">Version Archive</h4>
                    <div className="space-y-3 text-xs">
                      {selectedDoc.versionHistory.map((v, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border border-black/5 rounded-xl hover:bg-neutral-50/50">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black text-sm">v{v.version}</span>
                              <span className="text-[10px] text-neutral-400">{v.date}</span>
                            </div>
                            <p className="text-neutral-500 text-[11px] mt-1 font-light italic">By {v.author} • {v.summary}</p>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setSelectedDoc({
                                ...selectedDoc,
                                content: v.content,
                                name: `${selectedDoc.name} (v${v.version})`
                              });
                              showToast(`Loaded version v${v.version} in sidebar`);
                            }}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-bold"
                          >
                            Load Version
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-black/10 bg-white flex items-center justify-between shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleEditOpen(selectedDoc, e)}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors"
                  >
                    Edit Details
                  </button>

                  {role === "Owner" && (
                    <button 
                      onClick={(e) => handleDelete(selectedDoc, e)}
                      className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete File
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-neutral-500 hover:text-black font-bold text-xs uppercase tracking-widest"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Document Edit Details Modal ── */}
      <AnimatePresence>
        {editingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#faf9f6] rounded-3xl p-6 w-full max-w-lg border border-black/15 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingDoc(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-black mb-1 font-serif">Edit Document Metadata</h2>
              <p className="text-xs text-neutral-500 mb-6">Modify files metadata fields, access rights, and indexing tags.</p>

              <form onSubmit={saveEdit} className="space-y-4 text-xs font-medium text-black">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Document Title</label>
                  <input 
                    type="text" 
                    required 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Description</label>
                  <textarea 
                    value={editDesc}
                    rows={3}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Department</label>
                    <select 
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none cursor-pointer"
                    >
                      {["Finance", "Human Resources", "Engineering", "Marketing", "Legal", "General"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Access Scope</label>
                    <select 
                      value={editAccess}
                      onChange={(e) => setEditAccess(e.target.value as any)}
                      className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none cursor-pointer"
                    >
                      {["Organization Wide", "Team Only", "Department", "Private"].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1.5 font-bold">Tags (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full p-3 border border-black/10 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="e.g. audit, finance, urgent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
                  <button 
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="px-5 py-2.5 text-xs font-bold text-neutral-500 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-colors"
                  >
                    Apply Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── File Review Modal ── */}
      <AnimatePresence>
        {showReviewModal && reviewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#faf9f6] rounded-3xl p-6 w-full max-w-md border border-black/15 shadow-2xl relative"
            >
              <button 
                onClick={() => { setShowReviewModal(false); setReviewingDoc(null); }}
                className="absolute top-4 right-4 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-black mb-1 font-serif">Review Operations Document</h2>
              <p className="text-xs text-neutral-500 mb-6">Review file credentials, certify compliance status, or request revisions.</p>

              <div className="bg-white border border-black/5 rounded-2xl p-4 mb-4 text-xs">
                <span className="text-neutral-400 font-light">Target File</span>
                <p className="font-bold text-black text-sm mt-0.5">{reviewingDoc.name}</p>
                <p className="text-neutral-500 mt-1">{reviewingDoc.department} • Uploaded by {reviewingDoc.uploadedBy}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Reviewer Comments</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Enter professional feedback, approval notes, or rejection rationale..."
                    rows={4}
                    className="w-full p-3 border border-black/10 rounded-xl bg-white text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-black/10">
                  <button 
                    onClick={() => handleReviewSubmit("Rejected")}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-red-200 transition-colors"
                  >
                    Reject File
                  </button>
                  <button 
                    onClick={() => handleReviewSubmit("Approved")}
                    className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md transition-colors"
                  >
                    Approve & Certify
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Interactive Fullscreen Document Preview Modal ── */}
      <AnimatePresence>
        {showPreview && previewDoc && (
          <div className="fixed inset-0 z-50 bg-[#141414] text-white flex flex-col overflow-hidden font-sans">
            
            {/* Top Toolbar bar */}
            <div className="h-16 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center border border-white/5 text-white">
                  {getFileIcon(previewDoc.fileType)}
                </div>
                <div>
                  <span className="font-bold text-sm text-white block truncate max-w-xs">{previewDoc.name}</span>
                  <span className="text-[10px] text-neutral-400 block font-mono uppercase tracking-wider">{previewDoc.fileType} • {previewDoc.fileSize}</span>
                </div>
              </div>

              {/* View Control Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#262626] rounded-xl px-2 py-1.5 border border-white/5 text-xs text-neutral-300">
                  <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))} className="p-1 hover:text-white transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                  <span className="font-mono w-12 text-center font-bold">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(prev => Math.min(3, prev + 0.25))} className="p-1 hover:text-white transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                </div>

                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)} 
                  className={`p-2 rounded-xl border border-white/5 hover:bg-neutral-800 transition-colors ${isFullscreen ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'}`}
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => handleDownload(previewDoc)}
                  className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                <button 
                  onClick={() => setShowPreviewSidebar(!showPreviewSidebar)}
                  className={`p-2 rounded-xl border border-white/5 hover:bg-neutral-800 transition-colors ${showPreviewSidebar ? 'bg-white/10 text-white' : 'text-neutral-400'}`}
                  title="Document Info"
                >
                  <Info className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-6 bg-white/10" />

                <button 
                  onClick={() => { setShowPreview(false); setZoom(1); }}
                  className="p-2 bg-white/5 hover:bg-red-600 rounded-xl text-neutral-400 hover:text-white transition-all"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Workspace */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Preview Canvas */}
              <div className="flex-1 overflow-auto bg-[#0d0d0d] flex items-center justify-center p-8 relative">
                <motion.div 
                  style={{ scale: zoom }}
                  className="transition-transform duration-200 bg-white text-black shadow-2xl rounded-lg max-w-2xl w-full aspect-[1/1.4] relative overflow-hidden p-8 flex flex-col font-serif"
                >
                  {previewDoc.fileType === "PNG" || previewDoc.fileType === "JPG" ? (
                    <div className="absolute inset-0 bg-[#f5f4f0] flex items-center justify-center p-4">
                      <div className="text-center">
                        <ImageIcon className="w-20 h-20 text-neutral-300 mx-auto mb-4" />
                        <span className="text-neutral-400 text-xs italic font-sans block">{previewDoc.name} ({previewDoc.fileType})</span>
                        <p className="text-neutral-500 font-sans text-xs mt-2">Interactive Image Zoom Enabled ({Math.round(zoom * 100)}%)</p>
                      </div>
                    </div>
                  ) : (
                    /* Mock PDF Document Layout */
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* PDF Header */}
                        <div className="flex justify-between border-b border-black/10 pb-4 mb-6 text-xs font-sans text-neutral-400 tracking-wider">
                          <span className="font-bold text-black uppercase">{previewDoc.category} DOCUMENT DEPT.</span>
                          <span>CLASSIFIED - {previewDoc.visibility.toUpperCase()}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-black text-black leading-tight mb-4 font-serif">{previewDoc.name}</h1>
                        <div className="flex items-center gap-2 mb-6 font-sans">
                          <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest">Secure sandbox</span>
                          <span className="text-neutral-400 text-xs">v1.0 • {previewDoc.uploadDate}</span>
                        </div>

                        {/* Rich Content if available */}
                        {previewDoc.content ? (
                          <div className="text-xs text-neutral-700 leading-relaxed font-sans space-y-3 whitespace-pre-wrap">
                            {previewDoc.content}
                          </div>
                        ) : (
                          <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
                            <p className="font-bold">1. SCOPE AND PURPOSE</p>
                            <p className="font-light">This operations guide details standard compliance guidelines for {previewDoc.department} department. Access parameters are regulated under organizational protocol code.</p>
                            <p className="font-bold">2. SECURITY STATEMENT</p>
                            <p className="font-light">Data storage and processing of this file are sandboxed securely on the platform under authorization protocols. Any unauthorized downloads, modifications, or redistribution violate operational standards.</p>
                            <p className="font-bold">3. REVIEW AUDIT</p>
                            <p className="font-light">This certified file holds the official compliance rating of '{previewDoc.status}'. For revision logs or approval histories, consult the file information panel.</p>
                          </div>
                        )}
                      </div>

                      {/* PDF Footer */}
                      <div className="border-t border-black/10 pt-4 text-[9px] font-sans text-neutral-400 flex justify-between uppercase tracking-widest font-bold">
                        <span>SKITECH INC. OVERSIGHT</span>
                        <span>Page 1 of 1</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sidebar Info Section */}
              <AnimatePresence>
                {showPreviewSidebar && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 340, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="w-[340px] bg-white border-l border-gray-200 overflow-y-auto p-6 flex flex-col gap-6 font-sans text-xs shrink-0 shadow-md"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Document Summary</h4>
                      <p className="text-neutral-400 font-light leading-relaxed mb-4">{previewDoc.description || "No description provided."}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-white uppercase tracking-wider mb-2">Technical Properties</h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-neutral-300">
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Format</span>
                          <span className="font-bold font-mono text-white">{previewDoc.fileType}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Size</span>
                          <span className="font-bold font-mono text-white">{previewDoc.fileSize}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Uploaded By</span>
                          <span className="font-bold text-white">{previewDoc.uploadedBy || previewDoc.owner}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Status</span>
                          <span className="font-bold text-white block mt-0.5"><StatusBadge status={previewDoc.status} /></span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {previewDoc.tags && previewDoc.tags.map(t => (
                          <span key={t} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-neutral-300 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto border-t border-white/10 pt-4 flex gap-2">
                      <button 
                        onClick={() => handleDownload(previewDoc)}
                        className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-center border border-white/5 transition-all"
                      >
                        Download Original
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
