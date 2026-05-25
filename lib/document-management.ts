export type DocumentRole = "Owner" | "Manager" | "Staff";

export type DocumentStatus = "Active" | "Archived" | "Draft" | "Processing" | "Urgent" | "Pending Approval";

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  visibility: "Private" | "Team Only" | "Department" | "Organization Wide";
  department: string;
  owner: string;
  status: DocumentStatus;
  lastModified: string;
  uploadDate: string;
  fileType: "PDF" | "DOCX" | "XLSX" | "PNG" | "JPG";
  fileSize: string;
  isShared: boolean;
}

export interface UpdateNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "DOCUMENT" | "FILE" | "MESSAGE" | "SCHEDULE";
  status: DocumentStatus;
  priority: "High" | "Medium" | "Low" | "Critical";
  progress?: number;
}

export const dummyDocuments: DocumentType[] = [
  {
    id: "doc-1",
    name: "Q3 Financial Report",
    description: "Quarterly financial summary for Q3.",
    category: "Finance",
    tags: ["report", "finance", "q3"],
    visibility: "Organization Wide",
    department: "Finance",
    owner: "Jane Doe",
    status: "Active",
    lastModified: "2 hours ago",
    uploadDate: "2026-05-18",
    fileType: "PDF",
    fileSize: "2.4 MB",
    isShared: true,
  },
  {
    id: "doc-2",
    name: "Employee Handbook 2026",
    description: "Updated employee policies and guidelines.",
    category: "HR",
    tags: ["hr", "handbook", "policies"],
    visibility: "Organization Wide",
    department: "Human Resources",
    owner: "John Smith",
    status: "Active",
    lastModified: "1 day ago",
    uploadDate: "2026-05-10",
    fileType: "PDF",
    fileSize: "5.1 MB",
    isShared: true,
  },
  {
    id: "doc-3",
    name: "Project Alpha Requirements",
    description: "Technical requirements for Project Alpha.",
    category: "Engineering",
    tags: ["tech", "alpha", "specs"],
    visibility: "Team Only",
    department: "Engineering",
    owner: "Alice Johnson",
    status: "Draft",
    lastModified: "3 days ago",
    uploadDate: "2026-05-15",
    fileType: "DOCX",
    fileSize: "1.2 MB",
    isShared: false,
  },
  {
    id: "doc-4",
    name: "Marketing Assets - Summer Campaign",
    description: "Banners and graphics for summer.",
    category: "Marketing",
    tags: ["design", "summer", "campaign"],
    visibility: "Department",
    department: "Marketing",
    owner: "Bob Williams",
    status: "Processing",
    lastModified: "5 hours ago",
    uploadDate: "2026-05-17",
    fileType: "PNG",
    fileSize: "14.5 MB",
    isShared: true,
  },
  {
    id: "doc-5",
    name: "Compliance Audit Form",
    description: "Annual compliance check form.",
    category: "Legal",
    tags: ["audit", "compliance", "legal"],
    visibility: "Private",
    department: "Legal",
    owner: "Admin",
    status: "Pending Approval",
    lastModified: "1 week ago",
    uploadDate: "2026-05-01",
    fileType: "PDF",
    fileSize: "0.8 MB",
    isShared: false,
  }
];

export const dummyUpdates: UpdateNotification[] = [
  {
    id: "up-1",
    title: "New Policy Uploaded",
    description: "Employee Handbook 2026 has been published.",
    timestamp: "2 hours ago",
    type: "DOCUMENT",
    status: "Active",
    priority: "Medium",
  },
  {
    id: "up-2",
    title: "Compliance Audit Pending",
    description: "Compliance Audit Form requires manager approval.",
    timestamp: "5 hours ago",
    type: "FILE",
    status: "Pending Approval",
    priority: "Critical",
    progress: 75,
  },
  {
    id: "up-3",
    title: "Processing Assets",
    description: "Summer campaign graphics are currently being processed.",
    timestamp: "1 day ago",
    type: "DOCUMENT",
    status: "Processing",
    priority: "Low",
    progress: 45,
  }
];
