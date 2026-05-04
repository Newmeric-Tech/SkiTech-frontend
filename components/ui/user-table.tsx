"use client";

import { motion } from "framer-motion";
import { Eye, Trash2, Mail, RefreshCw } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { cn } from "./utils";
import type { User } from "./add-user-modal";

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onResendOTP: (user: User) => void;
  onDelete: (user: User) => void;
}

const RoleBadge = ({ role }: { role: string }) => {
  const styles = {
    Owner: "bg-amber-100 text-amber-700 border-amber-200",
    Manager: "bg-blue-100 text-blue-700 border-blue-200",
    Staff: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[role as keyof typeof styles] || "bg-neutral-100 text-neutral-700 border-neutral-200"
      )}
    >
      {role}
    </span>
  );
};

export function UserTable({ users, onView, onResendOTP, onDelete }: UserTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (users.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-8 text-center">
        <p className="text-neutral-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10 bg-black/[2%]">
              <th className="text-left p-4 text-sm font-medium text-neutral-500">Name</th>
              <th className="text-left p-4 text-sm font-medium text-neutral-500">Email</th>
              <th className="text-left p-4 text-sm font-medium text-neutral-500">Role</th>
              <th className="text-left p-4 text-sm font-medium text-neutral-500">Status</th>
              <th className="text-left p-4 text-sm font-medium text-neutral-500">Created Date</th>
              <th className="text-center p-4 text-sm font-medium text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-black/5 hover:bg-black/[3%] transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-black">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-neutral-600">{user.email}</td>
                <td className="p-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="p-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="p-4 text-sm text-neutral-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onView(user)}
                      className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-neutral-600" />
                    </button>
                    {user.status === "pending" && (
                      <button
                        onClick={() => onResendOTP(user)}
                        className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                        title="Resend OTP"
                      >
                        <RefreshCw className="w-4 h-4 text-neutral-600" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}