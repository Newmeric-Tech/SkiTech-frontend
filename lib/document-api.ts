import { api } from "./api";
import { DocumentWithExtra, ReviewHistoryEntry } from "./useDocumentStore";

/**
 * Enterprise Document Management System API Services
 * Demonstrates:
 * - API Integration Structure
 * - Validation & Error Handling
 * - Role-Based Middleware Hooks
 * - Secure File Storage Schema
 */
export const documentApi = {
  /**
   * Fetch all documents from FastAPI backend
   * Gracefully falls back to local storage if API is offline
   */
  getDocuments: async (role: string): Promise<DocumentWithExtra[]> => {
    try {
      const { data } = await api.get<DocumentWithExtra[]>("/documents", {
        headers: { "X-User-Role": role } // Middleware routing helper
      });
      return data;
    } catch (err) {
      console.warn("Backend /documents offline. Accessing secure local sandbox storage.", err);
      const stored = localStorage.getItem("skitech_docs");
      return stored ? JSON.parse(stored) : [];
    }
  },

  /**
   * Secure Multi-part Form Upload of Documents
   * Includes simulation of secure file storage handling and verification
   */
  uploadDocument: async (
    formData: FormData,
    role: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentWithExtra> => {
    // Validation
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;

    if (!name || name.trim().length < 3) {
      throw new Error("Validation Error: Title must be at least 3 characters long.");
    }
    if (!category) {
      throw new Error("Validation Error: Department/Category is required.");
    }
    if (file && file.size > 50 * 1024 * 1024) {
      throw new Error("Validation Error: Security breach - file exceeds 50MB secure upload limit.");
    }

    try {
      const { data } = await api.post<DocumentWithExtra>("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-User-Role": role
        },
        onUploadProgress
      });
      return data;
    } catch (err) {
      console.warn("FastAPI upload offline. Performing sandboxed local mock file processing.", err);
      // Simulate slow upload progress then return standard sandbox entry
      return new Promise((resolve) => {
        setTimeout(() => {
          const stored = localStorage.getItem("skitech_docs");
          const docs: DocumentWithExtra[] = stored ? JSON.parse(stored) : [];
          const newDoc: DocumentWithExtra = {
            id: `doc-${Date.now()}`,
            name: name || file?.name || "Uploaded_File",
            description: (formData.get("description") as string) || "Secured organization file",
            category: category,
            tags: ((formData.get("tags") as string) || "").split(",").map(t => t.trim()).filter(Boolean),
            visibility: (formData.get("visibility") as any) || "Organization Wide",
            department: category,
            owner: (formData.get("uploadedBy") as string) || "Current User",
            uploadedBy: (formData.get("uploadedBy") as string) || "Current User",
            status: (formData.get("status") as any) || "Active",
            lastModified: "Just now",
            uploadDate: new Date().toISOString().split("T")[0],
            fileType: (formData.get("fileType") as any) || "PDF",
            fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "1.5 MB",
            isShared: formData.get("visibility") !== "Private",
            reviewerComments: [],
            reviewHistory: [
              {
                id: `rev-${Date.now()}`,
                reviewer: (formData.get("assignedReviewer") as string) || "Manager Reviewer",
                status: "Pending",
                comments: "Initial secure landing.",
                timestamp: new Date().toLocaleTimeString()
              }
            ]
          };
          
          localStorage.setItem("skitech_docs", JSON.stringify([newDoc, ...docs]));
          resolve(newDoc);
        }, 1200);
      });
    }
  },

  /**
   * Direct Document Authoring inside Platform (Create New Document)
   */
  createDocument: async (
    docData: Partial<DocumentWithExtra>,
    role: string
  ): Promise<DocumentWithExtra> => {
    // Validation
    if (!docData.name || docData.name.trim().length < 3) {
      throw new Error("Validation Error: Document title is too short.");
    }
    if (role === "Staff" && docData.visibility === "Organization Wide") {
      throw new Error("Access Denied: Staff accounts are restricted from publishing organization-wide files.");
    }

    try {
      const { data } = await api.post<DocumentWithExtra>("/documents/create", docData, {
        headers: { "X-User-Role": role }
      });
      return data;
    } catch (err) {
      console.warn("FastAPI creation offline. Adding drafted file to local sandbox.", err);
      const stored = localStorage.getItem("skitech_docs");
      const docs: DocumentWithExtra[] = stored ? JSON.parse(stored) : [];
      const newDoc: DocumentWithExtra = {
        id: `doc-${Date.now()}`,
        name: docData.name!,
        description: docData.description || "Draft document created on platform",
        category: docData.category || "General",
        tags: docData.tags || [],
        visibility: docData.visibility || "Private",
        department: docData.department || "General",
        owner: docData.uploadedBy || "Current User",
        uploadedBy: docData.uploadedBy || "Current User",
        status: docData.status || "Draft",
        lastModified: "Just now",
        uploadDate: new Date().toISOString().split("T")[0],
        fileType: "DOCX",
        fileSize: "12 KB",
        isShared: docData.visibility !== "Private",
        content: docData.content || "",
        collaborators: docData.collaborators || [],
        reviewerComments: [],
        reviewHistory: [],
        versionHistory: [
          {
            version: "1.0",
            date: new Date().toISOString().split("T")[0],
            author: docData.uploadedBy || "Current User",
            summary: "Created draft in editor",
            content: docData.content || "",
          }
        ]
      };

      localStorage.setItem("skitech_docs", JSON.stringify([newDoc, ...docs]));
      return newDoc;
    }
  },

  /**
   * Action Approval & Reject System
   */
  reviewDocument: async (
    id: string,
    reviewer: string,
    status: "Approved" | "Rejected",
    comments: string,
    role: string
  ): Promise<ReviewHistoryEntry> => {
    // Role-based privilege enforcement
    if (role !== "Owner" && role !== "Manager") {
      throw new Error("Access Denied: Review operation requires Owner or Manager privileges.");
    }
    if (!comments || comments.trim().length < 5) {
      throw new Error("Validation Error: Reviewer feedback/comments must be at least 5 characters long.");
    }

    try {
      const { data } = await api.post<ReviewHistoryEntry>(`/documents/${id}/review`, {
        status,
        comments,
        reviewer
      }, {
        headers: { "X-User-Role": role }
      });
      return data;
    } catch (err) {
      console.warn("FastAPI review offline. Sandboxing review operation on client.", err);
      return new Promise((resolve) => {
        const stored = localStorage.getItem("skitech_docs");
        if (stored) {
          const docs: DocumentWithExtra[] = JSON.parse(stored);
          const updated = docs.map((doc) => {
            if (doc.id === id) {
              const nextStatus = status === "Approved" ? "Active" : "Rejected";
              const nextHistory: ReviewHistoryEntry = {
                id: `rev-${Date.now()}`,
                reviewer,
                status: status === "Approved" ? "Approved" : "Rejected",
                comments,
                timestamp: "Just now"
              };
              return {
                ...doc,
                status: nextStatus as any,
                reviewerComments: [comments, ...(doc.reviewerComments || [])],
                reviewHistory: [nextHistory, ...(doc.reviewHistory || [])]
              };
            }
            return doc;
          });
          localStorage.setItem("skitech_docs", JSON.stringify(updated));
        }

        resolve({
          id: `rev-${Date.now()}`,
          reviewer,
          status: status === "Approved" ? "Approved" : "Rejected",
          comments,
          timestamp: "Just now"
        });
      });
    }
  }
};
