import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <h3 className="text-sm font-medium text-slate-500">{label}</h3>
      <p className="text-3xl font-bold text-slate-950 tracking-tight mt-2">{value}</p>
    </motion.div>
  );
};

export default StatsCard;