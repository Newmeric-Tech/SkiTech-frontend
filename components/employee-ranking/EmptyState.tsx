"use client";

import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No results found",
  description = "Try adjusting your search or filter to find what you're looking for.",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <FileSearch className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm">{description}</p>
    </motion.div>
  );
}
