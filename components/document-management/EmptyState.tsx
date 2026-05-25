"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Search, Upload } from "lucide-react";

interface EmptyStateProps {
  type?: "no-documents" | "no-results" | "no-updates";
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  type = "no-documents",
  onAction,
  actionLabel = "Upload Document",
}: EmptyStateProps) {
  const configs = {
    "no-documents": {
      icon: Upload,
      title: "No Documents Yet",
      description: "Start by uploading your first file or creating a new document to get organized.",
      color: "bg-blue-50",
      iconColor: "text-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    "no-results": {
      icon: Search,
      title: "No Matching Documents",
      description: "Try adjusting your filters or search criteria to find what you're looking for.",
      color: "bg-amber-50",
      iconColor: "text-amber-500",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
    "no-updates": {
      icon: FileText,
      title: "No Updates",
      description: "You're all caught up! Check back later for new notifications and activity.",
      color: "bg-neutral-50",
      iconColor: "text-neutral-500",
      buttonColor: "bg-neutral-600 hover:bg-neutral-700",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.color} rounded-3xl border border-black/10 shadow-sm p-16 flex flex-col items-center justify-center text-center`}
    >
      {/* Animated Icon */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`w-16 h-16 rounded-full ${config.color} border-2 border-current flex items-center justify-center mb-6 ${config.iconColor}`}
      >
        <Icon className="w-8 h-8" />
      </motion.div>

      {/* Text */}
      <h3 className="text-xl font-bold text-black mb-2 font-serif">{config.title}</h3>
      <p className="text-neutral-500 text-sm font-light max-w-sm mb-8">{config.description}</p>

      {/* Action Button */}
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className={`${config.buttonColor} text-white px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors shadow-lg`}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
