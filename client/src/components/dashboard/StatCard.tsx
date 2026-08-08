"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  trend: string;
  color: string;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="admin-card p-6 flex flex-col gap-2"
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
          {label}
        </span>
        <h2 className="text-3xl font-black text-brand-dark">
          {value}
        </h2>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-brand-border mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">{trend}</span>
      </div>
    </motion.div>
  );
}
