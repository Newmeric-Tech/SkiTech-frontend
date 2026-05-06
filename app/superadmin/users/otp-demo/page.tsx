"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Search } from "lucide-react";
import { AddUserModal, User } from "@/components/ui/add-user-modal";
import { OTPModal } from "@/components/ui/otp-modal";
import { UserTable } from "@/components/ui/user-table";
import { ToastProvider, useToast } from "@/components/ui/toast-notification";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function UserManagementContent() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1234567890",
      role: "Manager",
      department: "Operations",
      password: "password123",
      status: "verified",
      createdAt: new Date("2025-03-15"),
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+1987654321",
      role: "Staff",
      department: "Maintenance",
      password: "password123",
      status: "pending",
      createdAt: new Date("2025-04-10"),
    },
  ]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"Owner" | "Manager" | "Staff">("Manager");
  const [pendingUser, setPendingUser] = useState<{ email: string; otp: string } | null>(null);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const handleAddUser = (user: User) => {
    const otp = generateOTP();
    setPendingUser({ email: user.email, otp: otp });
    setShowAddUserModal(false);
    setShowOTPModal(true);
  };

  const handleVerifyOTP = () => {
    if (pendingUser) {
      const newUser: User = {
        id: Math.random().toString(36).substring(7),
        name: pendingUser.email.split("@")[0],
        email: pendingUser.email,
        phone: "",
        role: selectedRole,
        department: "",
        password: "",
        status: "verified",
        createdAt: new Date(),
      };
      setUsers((prev) => [...prev, newUser]);
      showToast("User added successfully!", "success");
    }
    setShowOTPModal(false);
    setPendingUser(null);
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    setPendingUser(null);
  };

  const handleResendOTP = (user: User) => {
    const newOtp = generateOTP();
    setPendingUser({ email: user.email, otp: newOtp });
    setShowOTPModal(true);
    showToast(`New OTP sent to ${user.email} - OTP: ${newOtp}`, "success");
  };

  const handleDeleteUser = (user: User) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    showToast("User deleted successfully", "success");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    verified: users.filter((u) => u.status === "verified").length,
    pending: users.filter((u) => u.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-black"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          User Management
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          Manage users and verify their emails
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Total Users</p>
          <p className="text-2xl font-bold text-black mt-1">{stats.total}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Verified</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.verified}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-black/10 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 placeholder-neutral-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add User
          </motion.button>
        </div>

        <UserTable
          users={filteredUsers}
          onView={(user) => console.log("View:", user)}
          onResendOTP={handleResendOTP}
          onDelete={handleDeleteUser}
        />
      </div>

      {["Owner", "Manager", "Staff"].map((role) => (
        <button
          key={role}
          onClick={() => {
            setSelectedRole(role as "Owner" | "Manager" | "Staff");
            setShowAddUserModal(true);
          }}
          className="fixed bottom-4 right-4 z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      ))}

      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={handleAddUser}
        role={selectedRole}
      />

      <OTPModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        onVerify={handleVerifyOTP}
        userEmail={pendingUser?.email || ""}
        expectedOTP={pendingUser?.otp || ""}
      />
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <ToastProvider>
      <UserManagementContent />
    </ToastProvider>
  );
}