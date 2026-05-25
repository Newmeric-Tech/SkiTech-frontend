/**
 * Document Management API — lib/api/documents.ts
 * Typed wrapper for /v1/documents/* endpoints
 * Includes a mapper: backend DocumentMetadataResponse → frontend DocumentWithExtra
 */
import api from "@/lib/config/app";
import type { DocumentWithExtra } from "@/lib/useDocumentStore";

// ─── Backend response types ───────────────────────────────
export type BackendDocStatus =
  | "pending_review" | "approved" | "rejected" | "active" | "archived";

export type BackendAccessScope =
  | "organization_wide" | "department" | "private";

export interface BackendDocumentMeta {
  id: string;
  title: string;
  description: string | null;
  category: string;
  department: string | null;
  file_name: string;
  file_size: number;           // bytes
  file_type: string;           // MIME type
  file_extension: string;      // ".pdf"
  tags: string | null;         // comma-separated
  access_scope: BackendAccessScope;
  status: BackendDocStatus;
  upload_date: string;         // ISO datetime
  last_modified: string | null;
  uploaded_by: string | null;  // UUID
  owner_id: string | null;     // UUID
  is_confidential: boolean;
  requires_signature: boolean;
}

export interface BackendDocumentList {
  documents: BackendDocumentMeta[];
  total: number;
  skip: number;
  limit: number;
}

// ─── Mapping helpers ──────────────────────────────────────
const STATUS_MAP: Record<BackendDocStatus, string> = {
  pending_review: "Pending Approval",
  approved:       "Active",
  rejected:       "Rejected",
  active:         "Active",
  archived:       "Archived",
};

const SCOPE_MAP: Record<BackendAccessScope, string> = {
  organization_wide: "Organization Wide",
  department:        "Department",
  private:           "Private",
};

function bytesToSizeStr(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024)        return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function extToFileType(ext: string): "PDF" | "DOCX" | "XLSX" | "PNG" | "JPG" {
  const e = ext.replace(".", "").toLowerCase();
  if (e === "pdf")  return "PDF";
  if (e === "docx") return "DOCX";
  if (e === "xlsx") return "XLSX";
  if (e === "png")  return "PNG";
  if (e === "jpg" || e === "jpeg") return "JPG";
  return "PDF";
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Convert a backend DocumentMetadataResponse to the frontend DocumentWithExtra shape */
export function mapToDocumentWithExtra(doc: BackendDocumentMeta): DocumentWithExtra {
  const frontendStatus = STATUS_MAP[doc.status] as any;
  const visibility     = SCOPE_MAP[doc.access_scope] as any;

  return {
    id:           doc.id,
    name:         doc.title,
    description:  doc.description ?? "",
    category:     doc.category,
    tags:         doc.tags ? doc.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    visibility,
    department:   doc.department ?? doc.category,
    owner:        "Organization",          // Backend only gives UUID; no name available
    uploadedBy:   "System",
    status:       frontendStatus,
    lastModified: doc.last_modified ? fmtDate(doc.last_modified) : "Recently",
    uploadDate:   doc.upload_date ? new Date(doc.upload_date).toISOString().split("T")[0] : "",
    fileType:     extToFileType(doc.file_extension),
    fileSize:     bytesToSizeStr(doc.file_size),
    isShared:     doc.access_scope !== "private",
    reviewerComments: [],
    reviewHistory:    [],
    collaborators:    [],
    versionHistory:   [],
  };
}

// ─── API ─────────────────────────────────────────────────
export const documentsAPI = {

  /** List documents — returns mapped DocumentWithExtra[] */
  list: async (skip = 0, limit = 50): Promise<DocumentWithExtra[]> => {
    const { data } = await api.get<BackendDocumentMeta[]>("/v1/documents", {
      params: { skip, limit },
    });
    return data.map(mapToDocumentWithExtra);
  },

  /** Get single document by ID */
  getById: async (id: string): Promise<DocumentWithExtra> => {
    const { data } = await api.get<BackendDocumentMeta>(`/documents/${id}`);
    return mapToDocumentWithExtra(data);
  },

  /**
   * Upload a new document (multipart form).
   * Caller must supply the actual File object.
   */
  upload: async (
    file: File,
    meta: {
      title: string;
      description?: string;
      category: string;
      department?: string;
      tags?: string;
      access_scope?: BackendAccessScope;
      is_confidential?: boolean;
    },
    onProgress?: (pct: number) => void
  ): Promise<DocumentWithExtra> => {
    const fd = new FormData();
    fd.append("file",        file);
    fd.append("title",       meta.title);
    fd.append("category",    meta.category);
    if (meta.description)   fd.append("description",   meta.description);
    if (meta.department)    fd.append("department",    meta.department);
    if (meta.tags)          fd.append("tags",          meta.tags);
    fd.append("access_scope", meta.access_scope ?? "organization_wide");
    fd.append("is_confidential", String(meta.is_confidential ?? false));

    const { data } = await api.post<BackendDocumentMeta>("/v1/documents/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)); }
        : undefined,
    });
    return mapToDocumentWithExtra(data);
  },

  /** Submit a review for a document (manager/owner only) */
  review: async (
    id: string,
    status: "approved" | "rejected" | "in_progress",
    comments?: string
  ): Promise<void> => {
    await api.post(`/documents/${id}/review`, {
      review_status: status,
      comments,
    });
  },
};
