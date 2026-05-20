"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Employee, Shift } from "@/store/SchedulingStore";

interface ScheduleTableProps {
  employees: Employee[];
  shifts: Shift[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  onAssignShift?: (shiftId: string, employeeId: string) => void;
}

const departments = ["All", "Front Desk", "Housekeeping", "F&B", "Maintenance", "Security", "Wellness"];

// Days with mock dates (like Figma: MON [14], TUE [15], etc.)
const DAYS = [
  { label: "MON", date: "14" },
  { label: "TUE", date: "15" },
  { label: "WED", date: "16" },
  { label: "THU", date: "17" },
  { label: "FRI", date: "18" },
];

const WEEK_LABEL = "Oct 14 - Oct 20";

export function ScheduleTable({ employees, shifts, selectedDepartment, onDepartmentChange, onAssignShift }: ScheduleTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalCtx, setModalCtx] = useState<{ day?: string; time?: string; shiftId?: string }>({});

  const filteredEmployees =
    selectedDepartment === "All"
      ? employees
      : employees.filter((e) => e.department === selectedDepartment);

  const getShiftForEmployee = (employeeId: string, day: string): Shift | undefined =>
    shifts.find((s) => s.employeeId === employeeId && s.day === day);

  const getVacantShift = (day: string): Shift | undefined =>
    shifts.find((s) => s.isVacant && s.day === day);

  const availableEmployees = employees.filter((e) => e.status === "available");

  const openModal = (day?: string, time?: string, shiftId?: string) => {
    setModalCtx({ day, time, shiftId });
    setShowModal(true);
  };

  const handleAssign = (employeeId: string) => {
    if (modalCtx.shiftId && onAssignShift) {
      onAssignShift(modalCtx.shiftId, employeeId);
    }
    setShowModal(false);
  };

  // Helper to determine shift pill style based on time
  const getShiftStyle = (startTime: string) => {
    // If it's a morning shift (e.g., 08:00), make it dark blue. If afternoon, light blue.
    if (startTime.startsWith("08") || startTime.startsWith("09") || startTime.startsWith("10")) {
      return "bg-[#0f172a] text-white border border-[#0f172a]";
    }
    return "bg-blue-50 text-blue-600 border border-blue-100";
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Weekly Schedule</h3>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Week navigator */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-full px-1 py-1">
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">{WEEK_LABEL}</span>
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Department filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="px-0 py-1.5 bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Assign button */}
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky left-0 bg-white z-10 w-[250px]">
                  EMPLOYEE
                </th>
                {DAYS.map(({ label, date }) => (
                  <th
                    key={label}
                    className="px-2 py-4 text-center min-w-[120px]"
                  >
                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                      {label} [{date}]
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.slice(0, 5).map((employee, idx) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Employee cell */}
                  <td className="px-6 py-4 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: employee.color }}
                      >
                        {employee.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{employee.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{employee.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Shift cells */}
                  {DAYS.map(({ label: dayLabel }) => {
                    const dayKey = dayLabel.charAt(0) + dayLabel.slice(1, 3).toLowerCase(); // "Mon", "Tue", etc.
                    const shift = getShiftForEmployee(employee.id, dayKey.charAt(0).toUpperCase() + dayKey.slice(1));
                    const vacant = getVacantShift(dayKey.charAt(0).toUpperCase() + dayKey.slice(1));

                    return (
                      <td key={dayLabel} className="px-2 py-4 text-center align-middle">
                        {shift ? (
                          <div className="flex justify-center">
                            <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide ${getShiftStyle(shift.startTime)}`}>
                              {shift.startTime} - {shift.endTime}
                            </div>
                          </div>
                        ) : vacant && selectedDepartment === "All" ? (
                          <div className="flex justify-center">
                            <button
                              onClick={() => openModal(dayLabel, `${vacant.startTime} - ${vacant.endTime}`, vacant.id)}
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide bg-[#EF4444] text-white hover:bg-red-600 transition-colors shadow-sm"
                            >
                              Vacant (EMRG)
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-200 text-gray-400 text-[10px] font-bold tracking-wide">
                              OFF
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Assign Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assign Shift</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {modalCtx.day ? `${modalCtx.day} · ${modalCtx.time}` : "Select an available employee"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto">
              {availableEmployees.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No available employees right now.</p>
              ) : (
                availableEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: emp.color }}
                      >
                        {emp.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{emp.department} · {emp.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssign(emp.id)}
                      className="text-xs font-bold bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}