"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from "react";
import { schedulingAPI, mapBackendRequest } from "@/lib/api/scheduling";

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  avatar?: string;
  initials: string;
  color: string;
  status: "available" | "on-leave" | "absent" | "busy";
  overtimeEligible: boolean;
  matchPercentage?: number;
}

export interface Shift {
  id: string;
  employeeId: string;
  day: string;
  startTime: string;
  endTime: string;
  department: string;
  status: "scheduled" | "completed" | "vacant";
  isVacant?: boolean;
}

export interface EmergencyAlert {
  id: string;
  employeeName: string;
  department: string;
  shiftTime: string;
  reason: string;
  status: "active" | "dismissed" | "resolved";
  createdAt: string;
}

export interface ReplacementRequest {
  id: string;
  emergencyAlertId: string;
  shiftId: string;
  fromEmployee: string;
  toEmployeeId: string;
  toEmployeeName: string;
  toEmployeeDept: string;
  shiftTime: string;
  department: string;
  status: "pending" | "accepted" | "rejected" | "awaiting";
  incentive: number;
  overtimeEligible: boolean;
  sentAt: string;
  respondedAt?: string;
}

export interface TimelineEvent {
  id: string;
  type: "request-sent" | "request-viewed" | "staff-accepted" | "staff-rejected" | "shift-assigned" | "notification-dispatched" | "auto-assign-triggered";
  message: string;
  timestamp: string;
  requestId?: string;
  employeeName?: string;
}

const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getColor = (name: string): string => {
  const colors = ["#3B82F6", "#10B981", "#6366F1", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6"];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "e1", name: "Rahul Sharma", department: "Front Desk", role: "Senior Associate", status: "available", overtimeEligible: true, initials: "RS", color: getColor("Rahul Sharma") },
  { id: "e2", name: "Priya Singh", department: "Housekeeping", role: "Supervisor", status: "available", overtimeEligible: true, initials: "PS", color: getColor("Priya Singh") },
  { id: "e3", name: "Amit Kumar", department: "F&B", role: "Waiter", status: "on-leave", overtimeEligible: false, initials: "AK", color: getColor("Amit Kumar") },
  { id: "e4", name: "Sarah Johnson", department: "Front Desk", role: "Associate", status: "available", overtimeEligible: true, initials: "SJ", color: getColor("Sarah Johnson") },
  { id: "e5", name: "James Chen", department: "Maintenance", role: "Technician", status: "busy", overtimeEligible: true, initials: "JC", color: getColor("James Chen") },
  { id: "e6", name: "Maria Garcia", department: "Housekeeping", role: "Associate", status: "available", overtimeEligible: false, initials: "MG", color: getColor("Maria Garcia") },
  { id: "e7", name: "David Lee", department: "Security", role: "Officer", status: "available", overtimeEligible: true, initials: "DL", color: getColor("David Lee") },
  { id: "e8", name: "Emma Wilson", department: "F&B", role: "Bartender", status: "absent", overtimeEligible: false, initials: "EW", color: getColor("Emma Wilson") },
  { id: "e9", name: "Michael Brown", department: "Front Desk", role: "Associate", status: "available", overtimeEligible: true, initials: "MB", color: getColor("Michael Brown") },
  { id: "e10", name: "Lisa Anderson", department: "Wellness", role: "Therapist", status: "available", overtimeEligible: true, initials: "LA", color: getColor("Lisa Anderson") },
];

const INITIAL_SHIFTS: Shift[] = [
  { id: "s1", employeeId: "e1", day: "Mon", startTime: "09:00", endTime: "17:00", department: "Front Desk", status: "scheduled" },
  { id: "s2", employeeId: "e2", day: "Mon", startTime: "08:00", endTime: "16:00", department: "Housekeeping", status: "scheduled" },
  { id: "s3", employeeId: "e3", day: "Mon", startTime: "12:00", endTime: "20:00", department: "F&B", status: "scheduled" },
  { id: "s4", employeeId: "", day: "Mon", startTime: "18:00", endTime: "02:00", department: "Front Desk", status: "vacant", isVacant: true },
  { id: "s5", employeeId: "e4", day: "Tue", startTime: "09:00", endTime: "17:00", department: "Front Desk", status: "scheduled" },
  { id: "s6", employeeId: "e6", day: "Tue", startTime: "08:00", endTime: "16:00", department: "Housekeeping", status: "scheduled" },
  { id: "s7", employeeId: "", day: "Tue", startTime: "14:00", endTime: "22:00", department: "F&B", status: "vacant", isVacant: true },
  { id: "s8", employeeId: "e5", day: "Wed", startTime: "09:00", endTime: "17:00", department: "Maintenance", status: "scheduled" },
  { id: "s9", employeeId: "e7", day: "Wed", startTime: "20:00", endTime: "04:00", department: "Security", status: "scheduled" },
  { id: "s10", employeeId: "", day: "Thu", startTime: "09:00", endTime: "17:00", department: "Wellness", status: "vacant", isVacant: true },
  { id: "s11", employeeId: "e9", day: "Thu", startTime: "12:00", endTime: "20:00", department: "Front Desk", status: "scheduled" },
  { id: "s12", employeeId: "e10", day: "Fri", startTime: "10:00", endTime: "18:00", department: "Wellness", status: "scheduled" },
  { id: "s13", employeeId: "e1", day: "Fri", startTime: "09:00", endTime: "17:00", department: "Front Desk", status: "scheduled" },
  { id: "s14", employeeId: "e2", day: "Sat", startTime: "08:00", endTime: "16:00", department: "Housekeeping", status: "scheduled" },
  { id: "s15", employeeId: "", day: "Sat", startTime: "18:00", endTime: "02:00", department: "F&B", status: "vacant", isVacant: true },
  { id: "s16", employeeId: "e4", day: "Sun", startTime: "09:00", endTime: "17:00", department: "Front Desk", status: "scheduled" },
  { id: "s17", employeeId: "e6", day: "Sun", startTime: "08:00", endTime: "16:00", department: "Housekeeping", status: "scheduled" },
  { id: "s18", employeeId: "", day: "Sun", startTime: "12:00", endTime: "20:00", department: "Security", status: "vacant", isVacant: true },
];

const INITIAL_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: "ea1",
    employeeName: "Emma Wilson",
    department: "F&B",
    shiftTime: "12:00 PM - 8:00 PM",
    reason: "Sudden Leave",
    status: "active",
    createdAt: "2025-01-14 09:30",
  },
  {
    id: "ea2",
    employeeName: "Amit Kumar",
    department: "Housekeeping",
    shiftTime: "8:00 AM - 4:00 PM",
    reason: "Medical Emergency",
    status: "active",
    createdAt: "2025-01-14 07:15",
  },
];

const INITIAL_TIMELINE: TimelineEvent[] = [
  { id: "t1", type: "request-sent", message: "Replacement request sent to Rahul Sharma for F&B shift", timestamp: "2025-01-14 09:35", requestId: "r1", employeeName: "Rahul Sharma" },
  { id: "t2", type: "request-viewed", message: "Rahul Sharma viewed the replacement request", timestamp: "2025-01-14 09:40", requestId: "r1" },
  { id: "t3", type: "staff-accepted", message: "Rahul Sharma accepted the replacement shift", timestamp: "2025-01-14 09:45", requestId: "r1", employeeName: "Rahul Sharma" },
  { id: "t4", type: "notification-dispatched", message: "Notification sent to Maria Garcia for Housekeeping shift", timestamp: "2025-01-14 07:20", requestId: "r2" },
  { id: "t5", type: "auto-assign-triggered", message: "Auto-assign triggered for vacant Security shift", timestamp: "2025-01-14 06:00", requestId: "r3" },
];

const INITIAL_REPLACEMENT_REQUESTS: ReplacementRequest[] = [
  {
    id: "rr1",
    emergencyAlertId: "ea1",
    shiftId: "s4",
    fromEmployee: "Manager",
    toEmployeeId: "e1",
    toEmployeeName: "Rahul Sharma",
    toEmployeeDept: "Front Desk",
    shiftTime: "18:00 - 02:00",
    department: "Front Desk",
    status: "pending",
    incentive: 150,
    overtimeEligible: true,
    sentAt: "2025-01-15 10:30",
  },
  {
    id: "rr2",
    emergencyAlertId: "ea2",
    shiftId: "s7",
    fromEmployee: "Manager",
    toEmployeeId: "e2",
    toEmployeeName: "Priya Singh",
    toEmployeeDept: "Housekeeping",
    shiftTime: "14:00 - 22:00",
    department: "F&B",
    status: "pending",
    incentive: 120,
    overtimeEligible: true,
    sentAt: "2025-01-15 11:00",
  },
  {
    id: "rr3",
    emergencyAlertId: "ea1",
    shiftId: "s15",
    fromEmployee: "Manager",
    toEmployeeId: "e4",
    toEmployeeName: "Sarah Johnson",
    toEmployeeDept: "Front Desk",
    shiftTime: "18:00 - 02:00",
    department: "F&B",
    status: "accepted",
    incentive: 175,
    overtimeEligible: true,
    sentAt: "2025-01-15 09:00",
    respondedAt: "2025-01-15 09:30",
  },
];

interface SchedulingContextType {
  employees: Employee[];
  shifts: Shift[];
  emergencyAlerts: EmergencyAlert[];
  replacementRequests: ReplacementRequest[];
  timeline: TimelineEvent[];
  pendingNotifications: number;
  addEmergencyAlert: (alert: Omit<EmergencyAlert, "id" | "createdAt" | "status">) => void;
  dismissEmergencyAlert: (id: string) => void;
  resolveEmergencyAlert: (id: string) => void;
  sendReplacementRequest: (request: Omit<ReplacementRequest, "id" | "sentAt" | "status">) => void;
  acceptReplacementRequest: (id: string) => void;
  rejectReplacementRequest: (id: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id" | "timestamp">) => void;
  assignShift: (shiftId: string, employeeId: string) => void;
  getAvailableEmployees: (department?: string) => Employee[];
  getPendingRequests: () => ReplacementRequest[];
  getAcceptedRequests: () => ReplacementRequest[];
  getRejectedRequests: () => ReplacementRequest[];
  getAwaitingRequests: () => ReplacementRequest[];
  getEmployeeById: (id: string) => Employee | undefined;
  getShiftsByDay: (day: string) => Shift[];
  getVacantShifts: () => Shift[];
}

const SchedulingContext = createContext<SchedulingContextType | null>(null);

export function SchedulingProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(INITIAL_EMERGENCY_ALERTS);
  const [replacementRequests, setReplacementRequests] = useState<ReplacementRequest[]>(INITIAL_REPLACEMENT_REQUESTS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [pendingNotifications, setPendingNotifications] = useState(2);

  // ── Load real replacement requests from API on mount ──
  useEffect(() => {
    schedulingAPI.myDashboard()
      .then((dash) => {
        if (dash.emergency_shift_requests.length > 0) {
          const mapped = dash.emergency_shift_requests.map(mapBackendRequest);
          setReplacementRequests(mapped);
          setPendingNotifications(dash.pending_requests_count);
        }
      })
      .catch(() => {
        // API unavailable — keep mock data
      });
  }, []);

  const addEmergencyAlert = useCallback((alert: Omit<EmergencyAlert, "id" | "createdAt" | "status">) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    setEmergencyAlerts((prev) => [
      ...prev,
      { ...alert, id: `ea_${Date.now()}`, createdAt: now, status: "active" },
    ]);
  }, []);

  const dismissEmergencyAlert = useCallback((id: string) => {
    setEmergencyAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "dismissed" } : a));
  }, []);

  const resolveEmergencyAlert = useCallback((id: string) => {
    setEmergencyAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "resolved" } : a));
  }, []);

  const sendReplacementRequest = useCallback((request: Omit<ReplacementRequest, "id" | "sentAt" | "status">) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const newRequest: ReplacementRequest = {
      ...request,
      id: `rr_${Date.now()}`,
      sentAt: now,
      status: "pending",
    };
    
    const timelineEvent: TimelineEvent = {
      id: `t_${Date.now()}`,
      type: "request-sent",
      message: `Replacement request sent to ${request.toEmployeeName} for ${request.department} shift`,
      timestamp: now,
      requestId: newRequest.id,
      employeeName: request.toEmployeeName,
    };

    setReplacementRequests((prev) => [...prev, newRequest]);
    setTimeline((prev) => [timelineEvent, ...prev]);
    setPendingNotifications((prev) => prev + 1);
  }, []);

  const acceptReplacementRequest = useCallback((id: string) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const request = replacementRequests.find((r) => r.id === id);

    // Optimistic update
    setReplacementRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "accepted", respondedAt: now } : r));
    setPendingNotifications((prev) => Math.max(0, prev - 1));

    if (request) {
      const timelineEvent: TimelineEvent = {
        id: `t_${Date.now()}`,
        type: "staff-accepted",
        message: `${request.toEmployeeName} accepted the replacement shift`,
        timestamp: now,
        requestId: id,
        employeeName: request.toEmployeeName,
      };
      setTimeline((prev) => [timelineEvent, ...prev]);

      // Call real API — best effort (mock data IDs won't be valid UUIDs, that's OK)
      schedulingAPI.acceptReplacement(id, request.toEmployeeId).catch(() => {});
    }
  }, [replacementRequests]);

  const rejectReplacementRequest = useCallback((id: string) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const request = replacementRequests.find((r) => r.id === id);

    // Optimistic update
    setReplacementRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected", respondedAt: now } : r));
    setPendingNotifications((prev) => Math.max(0, prev - 1));

    if (request) {
      const timelineEvent: TimelineEvent = {
        id: `t_${Date.now()}`,
        type: "staff-rejected",
        message: `${request.toEmployeeName} rejected the replacement request`,
        timestamp: now,
        requestId: id,
        employeeName: request.toEmployeeName,
      };
      setTimeline((prev) => [timelineEvent, ...prev]);

      // Call real API — best effort
      schedulingAPI.rejectReplacement(id, request.toEmployeeId).catch(() => {});
    }
  }, [replacementRequests]);

  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, "id" | "timestamp">) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    setTimeline((prev) => [{ ...event, id: `t_${Date.now()}`, timestamp: now }, ...prev]);
  }, []);

  const assignShift = useCallback((shiftId: string, employeeId: string) => {
    setShifts((prev) => prev.map((s) => 
      s.id === shiftId 
        ? { ...s, employeeId, isVacant: false, status: "scheduled" as const }
        : s
    ));
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      const shift = shifts.find((s) => s.id === shiftId);
      const now = new Date().toISOString().replace("T", " ").slice(0, 16);
      const timelineEvent: TimelineEvent = {
        id: `t_${Date.now()}`,
        type: "shift-assigned",
        message: `${employee.name} assigned to ${shift?.day} shift (${shift?.startTime} - ${shift?.endTime})`,
        timestamp: now,
        employeeName: employee.name,
      };
      setTimeline((prev) => [timelineEvent, ...prev]);
    }
  }, [employees, shifts]);

  const getAvailableEmployees = useCallback((department?: string) => {
    return department
      ? employees.filter((e) => e.status === "available" && e.department === department)
      : employees.filter((e) => e.status === "available");
  }, [employees]);

  const getPendingRequests = useCallback(() => replacementRequests.filter((r) => r.status === "pending"), [replacementRequests]);
  const getAcceptedRequests = useCallback(() => replacementRequests.filter((r) => r.status === "accepted"), [replacementRequests]);
  const getRejectedRequests = useCallback(() => replacementRequests.filter((r) => r.status === "rejected"), [replacementRequests]);
  const getAwaitingRequests = useCallback(() => replacementRequests.filter((r) => r.status === "awaiting"), [replacementRequests]);
  const getEmployeeById = useCallback((id: string) => employees.find((e) => e.id === id), [employees]);
  const getShiftsByDay = useCallback((day: string) => shifts.filter((s) => s.day === day), [shifts]);
  const getVacantShifts = useCallback(() => shifts.filter((s) => s.isVacant), [shifts]);

  const value = useMemo(() => ({
    employees,
    shifts,
    emergencyAlerts,
    replacementRequests,
    timeline,
    pendingNotifications,
    addEmergencyAlert,
    dismissEmergencyAlert,
    resolveEmergencyAlert,
    sendReplacementRequest,
    acceptReplacementRequest,
    rejectReplacementRequest,
    addTimelineEvent,
    assignShift,
    getAvailableEmployees,
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests,
    getAwaitingRequests,
    getEmployeeById,
    getShiftsByDay,
    getVacantShifts,
  }), [
    employees,
    shifts,
    emergencyAlerts,
    replacementRequests,
    timeline,
    pendingNotifications,
    addEmergencyAlert,
    assignShift,
    dismissEmergencyAlert,
    resolveEmergencyAlert,
    sendReplacementRequest,
    acceptReplacementRequest,
    rejectReplacementRequest,
    addTimelineEvent,
    getAvailableEmployees,
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests,
    getAwaitingRequests,
    getEmployeeById,
    getShiftsByDay,
    getVacantShifts,
  ]);

  return (
    <SchedulingContext.Provider value={value}>
      {children}
    </SchedulingContext.Provider>
  );
}

export function useScheduling() {
  const ctx = useContext(SchedulingContext);
  if (!ctx) throw new Error("useScheduling must be used inside SchedulingProvider");
  return ctx;
}