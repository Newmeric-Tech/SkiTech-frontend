"use client";

import { useState, useEffect } from "react";
import { dummyDocuments, dummyUpdates, DocumentType, UpdateNotification } from "./document-management";
import { documentsAPI } from "./api/documents";

export interface ReviewHistoryEntry {
  id: string;
  reviewer: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  comments: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  documentName: string;
  timestamp: string;
  details?: string;
}

export interface DocumentWithExtra extends DocumentType {
  uploadedBy: string;
  reviewerComments?: string[];
  reviewHistory?: ReviewHistoryEntry[];
  content?: string; // Rich text content for platform-created files
  collaborators?: string[];
  versionHistory?: { version: string; date: string; author: string; summary: string; content: string }[];
}

export function useDocumentStore() {
  const [documents, setDocuments] = useState<DocumentWithExtra[]>([]);
  const [updates, setUpdates] = useState<UpdateNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dismissedUpdates, setDismissedUpdates] = useState<UpdateNotification[]>([]);
  const [lastDismissed, setLastDismissed] = useState<UpdateNotification | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load updates from localStorage (always local)
    const storedUpdates = localStorage.getItem("skitech_updates");
    if (storedUpdates) {
      setUpdates(JSON.parse(storedUpdates));
    } else {
      setUpdates(dummyUpdates);
      localStorage.setItem("skitech_updates", JSON.stringify(dummyUpdates));
    }

    // Load activity logs from localStorage (always local)
    const storedLogs = localStorage.getItem("skitech_activity_logs");
    if (storedLogs) {
      setActivityLogs(JSON.parse(storedLogs));
    } else {
      const seedLogs: ActivityLog[] = [
        { id: "log-1", action: "UPLOAD", actor: "Jane Doe", documentName: "Q3 Financial Report", timestamp: "2 hours ago", details: "Uploaded file Q3_Financial_Strategy.pdf" },
        { id: "log-2", action: "REVIEW_SUBMIT", actor: "System", documentName: "Compliance Audit Form", timestamp: "1 week ago", details: "Pending audit review checklist." },
      ];
      setActivityLogs(seedLogs);
      localStorage.setItem("skitech_activity_logs", JSON.stringify(seedLogs));
    }

    // Try real API for documents; fall back to localStorage → dummy data
    documentsAPI.list(0, 100)
      .then((apiDocs) => {
        setDocuments(apiDocs);
        localStorage.setItem("skitech_docs", JSON.stringify(apiDocs));
        setLoading(false);
      })
      .catch(() => {
        const storedDocs = localStorage.getItem("skitech_docs");
        if (storedDocs) {
          setDocuments(JSON.parse(storedDocs));
        } else {
          const fallback: DocumentWithExtra[] = dummyDocuments.map((doc) => ({
            ...doc,
            uploadedBy: doc.owner,
            reviewerComments: doc.status === "Pending Approval" ? ["Awaiting legal clearance."] : [],
            reviewHistory: doc.status === "Pending Approval"
              ? [{ id: "rev-init", reviewer: "System", status: "Pending" as const, comments: "Document submitted for standard operational compliance review.", timestamp: "2026-05-01 10:00 AM" }]
              : [],
            content: doc.description + "\n\nThis is a standard document template.",
            collaborators: ["Jane Doe", "Sarah Williams"],
            versionHistory: [{ version: "1.0", date: doc.uploadDate, author: doc.owner, summary: "Initial upload", content: doc.description + "\n\nThis is a standard document template." }],
          }));
          setDocuments(fallback);
          localStorage.setItem("skitech_docs", JSON.stringify(fallback));
        }
        setLoading(false);
      });
  }, []);

  // Helper: Save docs
  const saveDocs = (newDocs: DocumentWithExtra[]) => {
    setDocuments(newDocs);
    localStorage.setItem("skitech_docs", JSON.stringify(newDocs));
  };

  // Helper: Save updates
  const saveUpdates = (newUpdates: UpdateNotification[]) => {
    setUpdates(newUpdates);
    localStorage.setItem("skitech_updates", JSON.stringify(newUpdates));
  };

  // Helper: Save logs
  const saveLogs = (newLogs: ActivityLog[]) => {
    setActivityLogs(newLogs);
    localStorage.setItem("skitech_activity_logs", JSON.stringify(newLogs));
  };

  // Actions
  const addDocument = (doc: Omit<DocumentWithExtra, "id" | "uploadDate" | "lastModified" | "reviewHistory" | "reviewerComments">) => {
    const timestamp = new Date().toISOString().split("T")[0];
    const newDoc: DocumentWithExtra = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: timestamp,
      lastModified: "Just now",
      reviewerComments: [],
      reviewHistory: [
        {
          id: `rev-${Date.now()}`,
          reviewer: doc.uploadedBy,
          status: doc.status === "Pending Approval" ? "Pending" : "Approved",
          comments: doc.status === "Pending Approval" ? "Submitted for compliance check." : "Pre-approved upload.",
          timestamp: "Just now",
        }
      ],
      versionHistory: [
        {
          version: "1.0",
          date: timestamp,
          author: doc.uploadedBy,
          summary: "Initial Document Creation",
          content: doc.content || "No content details provided.",
        }
      ],
    };

    const nextDocs = [newDoc, ...documents];
    saveDocs(nextDocs);

    // Add activity log
    addLog("UPLOAD", doc.uploadedBy, doc.name, `Uploaded file size: ${doc.fileSize}`);

    // Add notification/update
    const newUpdate: UpdateNotification = {
      id: `up-${Date.now()}`,
      title: "New Document Uploaded",
      description: `${doc.name} was successfully uploaded by ${doc.uploadedBy}.`,
      timestamp: "Just now",
      type: "DOCUMENT",
      status: doc.status,
      priority: doc.status === "Urgent" ? "Critical" : "Medium",
    };
    saveUpdates([newUpdate, ...updates]);

    return newDoc;
  };

  const updateDocument = (id: string, updatedFields: Partial<DocumentWithExtra>, actor: string) => {
    const nextDocs = documents.map((doc) => {
      if (doc.id === id) {
        const docName = doc.name;
        // If content changed, record a new version
        let versionHistory = doc.versionHistory || [];
        if (updatedFields.content && updatedFields.content !== doc.content) {
          const nextVersion = (parseFloat(versionHistory[versionHistory.length - 1]?.version || "1.0") + 0.1).toFixed(1);
          versionHistory = [
            ...versionHistory,
            {
              version: nextVersion,
              date: new Date().toISOString().split("T")[0],
              author: actor,
              summary: "Updated document content",
              content: updatedFields.content,
            }
          ];
        }

        const nextDoc = {
          ...doc,
          ...updatedFields,
          lastModified: "Just now",
          versionHistory,
        };

        return nextDoc;
      }
      return doc;
    });

    saveDocs(nextDocs);

    const targetDoc = documents.find(d => d.id === id);
    if (targetDoc) {
      addLog("EDIT", actor, targetDoc.name, "Metadata or content edited.");
    }
  };

  const reviewDocument = (id: string, reviewer: string, status: "Approved" | "Rejected" | "Under Review", comments: string) => {
    const nextDocs = documents.map((doc) => {
      if (doc.id === id) {
        const nextStatus = status === "Approved" ? "Active" : status === "Rejected" ? "Rejected" as any : "Pending Approval";
        const historyEntry: ReviewHistoryEntry = {
          id: `rev-${Date.now()}`,
          reviewer,
          status: status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : "Under Review",
          comments,
          timestamp: "Just now",
        };

        return {
          ...doc,
          status: nextStatus,
          lastModified: "Just now",
          reviewerComments: [comments, ...(doc.reviewerComments || [])],
          reviewHistory: [historyEntry, ...(doc.reviewHistory || [])],
        };
      }
      return doc;
    });

    saveDocs(nextDocs);

    const doc = documents.find(d => d.id === id);
    if (doc) {
      addLog("REVIEW", reviewer, doc.name, `Reviewed status set to: ${status}. Comment: "${comments}"`);

      // Add to updates
      const newUpdate: UpdateNotification = {
        id: `up-${Date.now()}`,
        title: `Document ${status}`,
        description: `"${doc.name}" was ${status.toLowerCase()} by ${reviewer}.`,
        timestamp: "Just now",
        type: "DOCUMENT",
        status: status === "Approved" ? "Active" : "Pending Approval",
        priority: status === "Rejected" ? "High" : "Low",
      };
      saveUpdates([newUpdate, ...updates]);
    }
  };

  const addLog = (action: string, actor: string, documentName: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      actor,
      documentName,
      timestamp: "Just now",
      details,
    };
    saveLogs([newLog, ...activityLogs]);
  };

  const dismissUpdate = (id: string) => {
    const target = updates.find((u) => u.id === id);
    if (!target) return;

    setLastDismissed(target);
    const nextUpdates = updates.filter((u) => u.id !== id);
    saveUpdates(nextUpdates);
    setDismissedUpdates([target, ...dismissedUpdates]);

    addLog("DISMISS", "Current User", target.title, `Dismissed alert: ${target.description}`);
  };

  const undoDismissUpdate = () => {
    if (!lastDismissed) return;
    const nextUpdates = [lastDismissed, ...updates];
    saveUpdates(nextUpdates);
    setDismissedUpdates(dismissedUpdates.filter((u) => u.id !== lastDismissed.id));
    addLog("UNDO_DISMISS", "Current User", lastDismissed.title, "Restored dismissed notification.");
    setLastDismissed(null);
  };

  const triggerToast = (msg: string) => {
    // Standard utility helper
  };

  return {
    documents,
    updates,
    activityLogs,
    loading,
    addDocument,
    updateDocument,
    reviewDocument,
    dismissUpdate,
    undoDismissUpdate,
    hasUndo: lastDismissed !== null,
    lastDismissed,
    addLog,
  };
}
