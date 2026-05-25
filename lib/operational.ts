"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Wrench, PartyPopper, ShieldAlert, Bell, CheckCircle2, X, Send,
  Paperclip, Image, MapPin, AtSign, Tag, Filter, Search, Clock, User, MoreVertical,
  ChevronDown, ArrowUpRight, Flame, Snowflake, Wifi, Power, Droplets, Building,
  Star, Phone, Mail, Calendar, TrendingUp, TrendingDown, Minus, Upload,
  Eye, MessageSquare, Users, Activity, AlertCircle, Info
} from "lucide-react";

export type HandoverCategory = "complaint" | "event" | "maintenance" | "vip" | "safety" | "attention";
export type Priority = "low" | "medium" | "high" | "critical" | "emergency";
export type IssueSeverity = "low" | "medium" | "high" | "critical" | "emergency";
export type LogStatus = "open" | "in_progress" | "resolved" | "escalated" | "noted" | "pending" | "scheduled";

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatar?: string;
  color: string;
}

export interface HandoverLog {
  id: string;
  content: string;
  category: HandoverCategory;
  priority: Priority;
  status: LogStatus;
  reporter: StaffMember;
  createdAt: Date;
  mentionedStaff: StaffMember[];
  attachedImages: string[];
  attachments: { name: string; type: string; url: string }[];
  location?: string;
  roomNumber?: string;
  department?: string;
  resolved?: boolean;
  escalatedTo?: string;
  remark?: string;
  timeline?: { action: string; by: StaffMember; at: Date; note?: string }[];
}

export interface ComplaintIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: IssueSeverity;
  status: LogStatus;
  roomNumber?: string;
  department: string;
  affectedArea?: string;
  assignedTo?: StaffMember;
  createdAt: Date;
  updatedAt: Date;
  attachments: string[];
  proofImages: string[];
  resolutionTimeline: { action: string; by: StaffMember; at: Date; note?: string }[];
  slaDeadline?: Date;
  guestName?: string;
  guestContact?: string;
}

export interface OperationalEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  status: LogStatus;
  location?: string;
  timestamp: Date;
  createdBy: StaffMember;
  assignedTo?: StaffMember;
  attachments: string[];
  notes?: string;
}

export const categoryConfig: Record<HandoverCategory, { icon: any; color: string; bg: string; label: string }> = {
  complaint: { icon: AlertTriangle, color: "#EF4444", bg: "bg-red-50", label: "Complaint" },
  event: { icon: PartyPopper, color: "#8B5CF6", bg: "bg-purple-50", label: "Event" },
  maintenance: { icon: Wrench, color: "#F59E0B", bg: "bg-amber-50", label: "Maintenance" },
  vip: { icon: Star, color: "#EAB308", bg: "bg-yellow-50", label: "VIP Guest" },
  safety: { icon: ShieldAlert, color: "#DC2626", bg: "bg-red-50", label: "Safety Alert" },
  attention: { icon: Bell, color: "#EC4899", bg: "bg-pink-50", label: "Need Attention" },
};

export const priorityConfig: Record<Priority, { color: string; bg: string; label: string; borderColor: string }> = {
  low: { color: "#10B981", bg: "bg-emerald-50", label: "Low", borderColor: "border-emerald-200" },
  medium: { color: "#F59E0B", bg: "bg-amber-50", label: "Medium", borderColor: "border-amber-200" },
  high: { color: "#F97316", bg: "bg-orange-50", label: "High", borderColor: "border-orange-200" },
  critical: { color: "#EF4444", bg: "bg-red-50", label: "Critical", borderColor: "border-red-200" },
  emergency: { color: "#991B1B", bg: "bg-red-100", label: "Emergency", borderColor: "border-red-300" },
};

export const severityConfig: Record<IssueSeverity, { color: string; bg: string; label: string }> = {
  low: { color: "#10B981", bg: "bg-emerald-500", label: "Low" },
  medium: { color: "#F59E0B", bg: "bg-amber-500", label: "Medium" },
  high: { color: "#F97316", bg: "bg-orange-500", label: "High" },
  critical: { color: "#EF4444", bg: "bg-red-500", label: "Critical" },
  emergency: { color: "#991B1B", bg: "bg-red-700", label: "Emergency" },
};

export const statusConfig: Record<LogStatus, { color: string; bg: string; label: string; icon: any }> = {
  open: { color: "#3B82F6", bg: "bg-blue-500", label: "Open", icon: AlertCircle },
  pending: { color: "#A855F7", bg: "bg-purple-500", label: "Pending", icon: Clock },
  noted: { color: "#6B7280", bg: "bg-gray-500", label: "Noted", icon: Eye },
  in_progress: { color: "#F59E0B", bg: "bg-amber-500", label: "In Progress", icon: Activity },
  scheduled: { color: "#8B5CF6", bg: "bg-purple-500", label: "Scheduled", icon: Calendar },
  escalated: { color: "#EF4444", bg: "bg-red-500", label: "Escalated", icon: ArrowUpRight },
  resolved: { color: "#10B981", bg: "bg-emerald-500", label: "Resolved", icon: CheckCircle2 },
};

export const departmentIcons: Record<string, any> = {
  "Housekeeping": Building,
  "Maintenance": Wrench,
  "F&B": PartyPopper,
  "Front Desk": User,
  "Security": ShieldAlert,
  "Kitchen": Droplets,
  "Pool": Snowflake,
  "Gym": Activity,
  "Spa": Star,
  "WiFi": Wifi,
  "Power": Power,
  "HVAC": Snowflake,
};

export const staffMembers: StaffMember[] = [
  { id: "1", name: "Fatima Al-Hassan", initials: "FA", role: "Housekeeping Lead", color: "#6366F1" },
  { id: "2", name: "Ahmed Khalid", initials: "AK", role: "F&B Supervisor", color: "#3B82F6" },
  { id: "3", name: "Raj Patel", initials: "RP", role: "Maintenance Tech", color: "#10B981" },
  { id: "4", name: "Sarah Mitchell", initials: "SM", role: "Front Desk Sr.", color: "#F59E0B" },
  { id: "5", name: "James Lee", initials: "JL", role: "Concierge", color: "#8B5CF6" },
  { id: "6", name: "Maria Santos", initials: "MS", role: "Housekeeper", color: "#EC4899" },
  { id: "7", name: "Carlos Rivera", initials: "CR", role: "Head Chef", color: "#14B8A6" },
  { id: "8", name: "Nina Patel", initials: "NP", role: "Spa Therapist", color: "#0EA5E9" },
  { id: "9", name: "Omar Hassan", initials: "OH", role: "Security Officer", color: "#DC2626" },
  { id: "10", name: "Lisa Wong", initials: "LW", role: "Guest Relations", color: "#7C3AED" },
];

export const dummyHandoverLogs: HandoverLog[] = [
  {
    id: "log-001",
    content: "Room 305 AC not cooling properly. Guest complained about heat. Temperature set to 18°C but room feels like 28°C. Need HVAC maintenance ASAP.",
    category: "maintenance",
    priority: "high",
    status: "in_progress",
    reporter: staffMembers[2],
    createdAt: new Date(Date.now() - 45 * 60000),
    mentionedStaff: [staffMembers[2]],
    attachedImages: [],
    location: "Floor 3 - Room 305",
    roomNumber: "305",
    department: "Maintenance",
    timeline: [
      { action: "Logged", by: staffMembers[2], at: new Date(Date.now() - 45 * 60000) },
      { action: "Assigned to Raj Patel", by: staffMembers[3], at: new Date(Date.now() - 40 * 60000) },
    ],
  },
  {
    id: "log-002",
    content: "VIP Guest Mr. Hassan Abdullah checking in tomorrow. Suite 501 reserved. Requires red carpet welcome, fresh flowers, fruit basket, and complimentary spa treatment.",
    category: "vip",
    priority: "critical",
    status: "pending",
    reporter: staffMembers[4],
    createdAt: new Date(Date.now() - 2 * 3600000),
    mentionedStaff: [staffMembers[0], staffMembers[7], staffMembers[6]],
    attachedImages: [],
    location: "Suite 501",
    roomNumber: "501",
    department: "Guest Relations",
    timeline: [
      { action: "Logged", by: staffMembers[4], at: new Date(Date.now() - 2 * 3600000) },
    ],
  },
  {
    id: "log-003",
    content: "Guest in Room 412 filed formal complaint about noise from floor 5 construction. Woke up at 3 AM. Requesting room change or refund.",
    category: "complaint",
    priority: "high",
    status: "escalated",
    reporter: staffMembers[3],
    createdAt: new Date(Date.now() - 5 * 3600000),
    mentionedStaff: [staffMembers[0]],
    attachedImages: [],
    roomNumber: "412",
    department: "Front Desk",
    escalatedTo: "Manager",
    timeline: [
      { action: "Complaint filed", by: staffMembers[3], at: new Date(Date.now() - 5 * 3600000) },
      { action: "Escalated to Manager", by: staffMembers[3], at: new Date(Date.now() - 4 * 3600000), note: "Guest demanding refund" },
    ],
  },
  {
    id: "log-004",
    content: "Fire alarm triggered in kitchen area - minor smoke from oven. Quick response, no actual danger. Security checked all clear.",
    category: "safety",
    priority: "emergency",
    status: "resolved",
    reporter: staffMembers[8],
    createdAt: new Date(Date.now() - 8 * 3600000),
    mentionedStaff: [],
    attachedImages: [],
    location: "Main Kitchen",
    department: "Security",
    resolved: true,
    timeline: [
      { action: "Alert triggered", by: staffMembers[8], at: new Date(Date.now() - 8 * 3600000) },
      { action: "Resolved - All clear", by: staffMembers[8], at: new Date(Date.now() - 7.5 * 3600000) },
    ],
  },
  {
    id: "log-005",
    content: "Banquet hall setup in progress for wedding event tomorrow. 200 guests expected. Need extra tables, chairs, and extended bar service.",
    category: "event",
    priority: "medium",
    status: "scheduled",
    reporter: staffMembers[1],
    createdAt: new Date(Date.now() - 3 * 3600000),
    mentionedStaff: [staffMembers[6], staffMembers[1]],
    attachedImages: [],
    location: "Banquet Hall",
    department: "F&B",
    timeline: [
      { action: "Event scheduled", by: staffMembers[1], at: new Date(Date.now() - 3 * 3600000) },
    ],
  },
  {
    id: "log-006",
    content: "Pool area floor slippery near hot tub. Multiple guests reported near miss. Need immediate cleaning and anti-slip mat installation.",
    category: "attention",
    priority: "critical",
    status: "open",
    reporter: staffMembers[0],
    createdAt: new Date(Date.now() - 30 * 60000),
    mentionedStaff: [staffMembers[2]],
    attachedImages: [],
    location: "Pool Area",
    department: "Housekeeping",
    timeline: [
      { action: "Issue reported", by: staffMembers[0], at: new Date(Date.now() - 30 * 60000) },
    ],
  },
];

export const dummyComplaints: ComplaintIssue[] = [
  {
    id: "comp-001",
    title: "AC Not Working - Room Overheating",
    description: "Guest reports room temperature at 28°C despite AC set to 18°C. Guest uncomfortable, requesting immediate resolution or room change.",
    category: "Maintenance",
    severity: "high",
    status: "in_progress",
    roomNumber: "305",
    department: "Maintenance",
    affectedArea: "Floor 3",
    assignedTo: staffMembers[2],
    createdAt: new Date(Date.now() - 2 * 3600000),
    updatedAt: new Date(Date.now() - 30 * 60000),
    attachments: [],
    proofImages: [],
    resolutionTimeline: [
      { action: "Created", by: staffMembers[3], at: new Date(Date.now() - 2 * 3600000) },
      { action: "Assigned to Maintenance", by: staffMembers[3], at: new Date(Date.now() - 1.5 * 3600000) },
      { action: "Technician dispatched", by: staffMembers[2], at: new Date(Date.now() - 1 * 3600000) },
    ],
    slaDeadline: new Date(Date.now() + 2 * 3600000),
    guestName: "John Smith",
    guestContact: "+971 50 123 4567",
  },
  {
    id: "comp-002",
    title: "Noise Complaint - Construction Noise",
    description: "Guest unable to sleep due to loud construction noise from floor 5. Woke up at 3 AM. Formally requesting compensation.",
    category: "Noise",
    severity: "critical",
    status: "escalated",
    roomNumber: "412",
    department: "Front Desk",
    affectedArea: "Floor 4",
    assignedTo: staffMembers[3],
    createdAt: new Date(Date.now() - 8 * 3600000),
    updatedAt: new Date(Date.now() - 1 * 3600000),
    attachments: [],
    proofImages: [],
    resolutionTimeline: [
      { action: "Complaint filed", by: staffMembers[3], at: new Date(Date.now() - 8 * 3600000) },
      { action: "Escalated to Manager", by: staffMembers[3], at: new Date(Date.now() - 6 * 3600000) },
    ],
    slaDeadline: new Date(Date.now() + 1 * 3600000),
    guestName: "Michael Brown",
    guestContact: "+971 55 987 6543",
  },
  {
    id: "comp-003",
    title: " Hot Water Not Working",
    description: "No hot water in bathroom. Guest requested to shower but water stays cold.",
    category: "Maintenance",
    severity: "medium",
    status: "resolved",
    roomNumber: "208",
    department: "Maintenance",
    affectedArea: "Floor 2",
    assignedTo: staffMembers[2],
    createdAt: new Date(Date.now() - 5 * 3600000),
    updatedAt: new Date(Date.now() - 2 * 3600000),
    attachments: [],
    proofImages: [],
    resolutionTimeline: [
      { action: "Issue reported", by: staffMembers[0], at: new Date(Date.now() - 5 * 3600000) },
      { action: "Resolved", by: staffMembers[2], at: new Date(Date.now() - 2 * 3600000) },
    ],
    guestName: "Emma Wilson",
  },
  {
    id: "comp-004",
    title: "Room Not Cleaned - Late Checkout Issue",
    description: "Housekeeping did not clean room despite late checkout approval. Guest returned to dirty room.",
    category: "Housekeeping",
    severity: "medium",
    status: "open",
    roomNumber: "510",
    department: "Housekeeping",
    affectedArea: "Floor 5",
    createdAt: new Date(Date.now() - 4 * 3600000),
    updatedAt: new Date(Date.now() - 4 * 3600000),
    attachments: [],
    proofImages: [],
    resolutionTimeline: [],
    slaDeadline: new Date(Date.now() + 4 * 3600000),
    guestName: "David Chen",
  },
  {
    id: "comp-005",
  title: "WiFi Signal Very Weak",
    description: "Business guest unable to join video calls. WiFi continuously disconnects. Affecting work.",
    category: "Technical",
    severity: "high",
    status: "in_progress",
    roomNumber: "702",
    department: "IT",
    affectedArea: "Floor 7",
    assignedTo: staffMembers[2],
    createdAt: new Date(Date.now() - 6 * 3600000),
    updatedAt: new Date(Date.now() - 2 * 3600000),
    attachments: [],
    proofImages: [],
    resolutionTimeline: [
      { action: "Ticket created", by: staffMembers[4], at: new Date(Date.now() - 6 * 3600000) },
      { action: "IT team dispatched", by: staffMembers[2], at: new Date(Date.now() - 4 * 3600000) },
    ],
    guestName: "Jennifer Lee",
    guestContact: "+971 50 456 7890",
  },
  {
    id: "comp-006",
    title: "Food Poisoning Suspected - Restaurant",
    description: "Multiple guests reported feeling ill after dinner at main restaurant. 3 guests affected. Need medical attention and investigation.",
    category: "Food Safety",
    severity: "emergency",
    status: "escalated",
    roomNumber: "Restaurant",
    department: "F&B",
    affectedArea: "Main Restaurant",
    assignedTo: staffMembers[6],
    createdAt: new Date(Date.now() - 2 * 3600000),
    updatedAt: new Date(Date.now() - 30 * 60000),
    attachments: [],
    proofImages: [],
    resolutionTimeline: [
      { action: "Incident reported", by: staffMembers[1], at: new Date(Date.now() - 2 * 3600000) },
      { action: "Escalated to Manager & Medical", by: staffMembers[1], at: new Date(Date.now() - 1.5 * 3600000) },
    ],
    slaDeadline: new Date(Date.now() + 30 * 60000),
  },
];

export const dummyOperationalEvents: OperationalEvent[] = [
  {
    id: "evt-001",
    title: "VIP Arrival - Mr. Hassan Abdullah",
    description: "Expected at 2:00 PM. Suite 501 ready with all amenities.",
    type: "VIP Arrival",
    status: "scheduled",
    location: "Main Entrance",
    timestamp: new Date(Date.now() + 2 * 3600000),
    createdBy: staffMembers[4],
    assignedTo: staffMembers[4],
  },
  {
    id: "evt-002",
    title: "HVAC System Inspection",
    description: "Quarterly inspection of all HVAC units in guest floors.",
    type: "Maintenance",
    status: "in_progress",
    location: "All Floors",
    timestamp: new Date(Date.now() - 1 * 3600000),
    createdBy: staffMembers[2],
    assignedTo: staffMembers[2],
  },
  {
    id: "evt-003",
    title: "Banquet Setup - Wedding Event",
    description: "200 pax setup. Tables, chairs, bar, stage ready by 6 PM.",
    type: "Event",
    status: "pending",
    location: "Banquet Hall",
    timestamp: new Date(Date.now() + 4 * 3600000),
    createdBy: staffMembers[1],
    assignedTo: staffMembers[1],
  },
  {
    id: "evt-004",
    title: "Room 305 - AC Repair",
    description: "Compressor module replacement required.",
    type: "Maintenance",
    status: "in_progress",
    location: "Room 305",
    timestamp: new Date(Date.now() - 30 * 60000),
    createdBy: staffMembers[2],
    assignedTo: staffMembers[2],
  },
  {
    id: "evt-005",
    title: "Security Alert - Fire Alarm",
    description: "Minor smoke in kitchen. Resolved. All clear.",
    type: "Safety",
    status: "resolved",
    location: "Kitchen",
    timestamp: new Date(Date.now() - 8 * 3600000),
    createdBy: staffMembers[8],
  },
  {
    id: "evt-006",
    title: "Pool Area - Slip Hazard",
    description: "Floor cleaning and anti-slip mats needed.",
    type: "Maintenance",
    status: "noted",
    location: "Pool Area",
    timestamp: new Date(Date.now() - 30 * 60000),
    createdBy: staffMembers[0],
    assignedTo: staffMembers[2],
  },
  {
    id: "evt-007",
    title: "Check-in Rush - 25 Rooms",
    description: "Expected check-in surge. All desks staffed.",
    type: "Operations",
    status: "in_progress",
    location: "Front Desk",
    timestamp: new Date(Date.now() - 1 * 3600000),
    createdBy: staffMembers[3],
  },
];

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function formatSlaTimeRemaining(deadline: Date): { text: string; urgent: boolean; critical: boolean } {
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMs < 0) return { text: "SLA Breached", urgent: true, critical: true };
  if (diffMins <= 30) return { text: `${diffMins}m left`, urgent: true, critical: false };
  if (diffHours <= 2) return { text: `${diffHours}h left`, urgent: false, critical: false };
  return { text: `${diffHours}h left`, urgent: false, critical: false };
}