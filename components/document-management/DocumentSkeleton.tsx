"use client";

import React from "react";
import { motion } from "framer-motion";

interface DocumentSkeletonProps {
  count?: number;
  view?: "list" | "grid";
}

export function DocumentSkeleton({ count = 5, view = "list" }: DocumentSkeletonProps) {
  const skeletons = Array.from({ length: count }).map((_, i) => i);

  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletons.map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-neutral-200 rounded-xl" />
              <div className="w-12 h-4 bg-neutral-200 rounded" />
            </div>
            <div>
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
            </div>
            <div className="h-8 bg-neutral-100 rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {skeletons.map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white p-4 rounded-xl border border-black/10 shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-8 h-8 bg-neutral-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-48" />
              <div className="h-3 bg-neutral-100 rounded w-96" />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-4 bg-neutral-200 rounded w-16" />
            <div className="h-6 bg-neutral-200 rounded-lg w-20" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
