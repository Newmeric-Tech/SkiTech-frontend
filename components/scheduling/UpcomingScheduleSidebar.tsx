"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Building2 } from "lucide-react";
import { Shift, Employee } from "@/store/SchedulingStore";

interface UpcomingScheduleSidebarProps {
  shifts: Shift[];
  employees: Employee[];
}

const dayLabels: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export function UpcomingScheduleSidebar({ shifts, employees }: UpcomingScheduleSidebarProps) {
  const getEmployee = (id: string) => employees.find((e) => e.id === id);

  const upcomingShifts = shifts
    .filter((s) => s.employeeId && !s.isVacant)
    .slice(0, 7);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {upcomingShifts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 text-sm">No upcoming shifts scheduled</p>
          </div>
        ) : (
          upcomingShifts.map((shift, index) => {
            const employee = getEmployee(shift.employeeId);
            
            return (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {dayLabels[shift.day]}
                  </span>
                  <span className="text-xs text-gray-400">{shift.day}</span>
                </div>
                <div className="flex items-center gap-3">
                  {employee && (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: employee.color }}
                    >
                      {employee.initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {employee?.name || "Unassigned"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}