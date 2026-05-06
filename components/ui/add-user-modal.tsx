"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Briefcase, Lock } from "lucide-react";
import { cn } from "./utils";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  password: string;
  status: "pending" | "verified";
  createdAt: Date;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: User) => void;
  role: "Owner" | "Manager" | "Staff";
}

export function AddUserModal({ isOpen, onClose, onAddUser, role }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role,
      department: formData.department,
      password: formData.password,
      status: "pending",
      createdAt: new Date(),
    };
    onAddUser(newUser);
    setFormData({ name: "", email: "", phone: "", department: "", password: "" });
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "", department: "", password: "" });
    setErrors({});
    onClose();
  };

  const inputFields = [
    {
      name: "name",
      label: "Full Name",
      icon: User,
      type: "text",
      placeholder: "Enter full name",
    },
    {
      name: "email",
      label: "Email Address",
      icon: Mail,
      type: "email",
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone Number",
      icon: Phone,
      type: "tel",
      placeholder: "Enter phone number",
    },
    {
      name: "department",
      label: "Department (Optional)",
      icon: Briefcase,
      type: "text",
      placeholder: "Enter department",
    },
    {
      name: "password",
      label: "Password",
      icon: Lock,
      type: "password",
      placeholder: "Enter password",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>

            <div className="mb-6">
              <h2
                className="text-xl font-bold text-black"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Add {role}
              </h2>
              <p className="text-neutral-500 text-sm mt-1">
                Fill in the details to add a new {role.toLowerCase()}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {inputFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={field.type}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 bg-white/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors",
                        errors[field.name]
                          ? "border-red-500 focus:border-red-500"
                          : "border-black/10 focus:border-neutral-900"
                      )}
                    />
                  </div>
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <div className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-lg text-sm text-neutral-600">
                  {role}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-black/10 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Add {role}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { User };