import React from "react";
import { 
  FileText, File, FileCode, Image as ImageIcon,
  Clock, CheckCircle, AlertCircle, RefreshCw, XCircle, Share2
} from "lucide-react";
import { DocumentStatus } from "@/lib/document-management";

export const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status) {
      case "Secure": 
      case "Active": return "bg-black text-white border-black";
      case "Archived": return "bg-neutral-100 text-neutral-500 border-neutral-200";
      case "Draft": return "bg-neutral-100 text-black border-neutral-200";
      case "Processing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Urgent": return "bg-red-50 text-red-700 border-red-200";
      case "Pending Approval": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${getStyles()}`}>
      {status}
    </span>
  );
};

export const getFileIcon = (type: string) => {
  switch (type) {
    case "PDF": return <FileText className="w-8 h-8 text-red-500" />;
    case "DOCX": return <FileText className="w-8 h-8 text-blue-500" />;
    case "XLSX": return <FileCode className="w-8 h-8 text-green-500" />;
    case "PNG":
    case "JPG": return <ImageIcon className="w-8 h-8 text-purple-500" />;
    default: return <File className="w-8 h-8 text-slate-500" />;
  }
};
