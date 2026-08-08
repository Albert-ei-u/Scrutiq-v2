"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword,
}) => {
  const requirements = [
    {
      label: "Minimum 8 characters",
      met: password.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least one number",
      met: /[0-9]/.test(password),
    },
    {
      label: "At least one special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passwordsMatch = confirmPassword !== undefined && password !== "" && password === confirmPassword;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4 space-y-2 overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 transition-all duration-300 ${
              req.met ? "text-emerald-500" : "text-scrutiq-muted"
            }`}
          >
            <div
              className={`size-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                req.met
                  ? "bg-emerald-500/10 border-emerald-500"
                  : "bg-scrutiq-bg border-scrutiq-border"
              }`}
            >
              {req.met ? (
                <Check className="size-2.5 stroke-[4]" />
              ) : (
                <X className="size-2.5 stroke-[4] opacity-50" />
              )}
            </div>
            <span className="text-[9px] font-black tracking-[0.1em] uppercase">
              {req.label}
            </span>
          </div>
        ))}
        
        {confirmPassword !== undefined && (
          <div
            className={`flex items-center gap-2 transition-all duration-300 md:col-span-2 ${
              passwordsMatch ? "text-emerald-500" : "text-scrutiq-muted"
            }`}
          >
            <div
              className={`size-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                passwordsMatch
                  ? "bg-emerald-500/10 border-emerald-500"
                  : "bg-scrutiq-bg border-scrutiq-border"
              }`}
            >
              {passwordsMatch ? (
                <Check className="size-2.5 stroke-[4]" />
              ) : (
                <X className="size-2.5 stroke-[4] opacity-50" />
              )}
            </div>
            <span className="text-[9px] font-black tracking-[0.1em] uppercase">
              Passwords match
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-scrutiq-bg rounded-full mt-3 overflow-hidden border border-scrutiq-border/30">
        <motion.div
          className={`h-full transition-all duration-500 ${
            requirements.filter((r) => r.met).length === requirements.length
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              : "bg-scrutiq-blue"
          }`}
          initial={{ width: 0 }}
          animate={{
            width: `${(requirements.filter((r) => r.met).length / requirements.length) * 100}%`,
          }}
        />
      </div>
    </motion.div>
  );
};

export default PasswordRequirements;
