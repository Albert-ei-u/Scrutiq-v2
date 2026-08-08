"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ArrowRight,
  Briefcase,
  Users,
  Search,
  ChevronRight,
  Zap,
  Globe,
  Database,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-scrutiq-bg flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] size-[600px] bg-scrutiq-blue/5 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div
          className="absolute bottom-[-20%] right-[-10%] size-[600px] bg-purple-500/5 rounded-full blur-[120px] opacity-60 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#2C7BE5 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl space-y-16 relative z-10"
      >
        {/* Header Section */}
        <div className="space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-scrutiq-blue/20 rounded-2xl blur-xl group-hover:bg-scrutiq-blue/30 transition-all duration-500" />
              <div className="relative size-20 bg-scrutiq-surface rounded-2xl shadow-2xl flex items-center justify-center border border-scrutiq-border overflow-hidden">
                <img
                  src="/Untitled_design-removebg-preview.svg"
                  alt="Scrutiq Logo"
                  className="size-14 object-contain group-hover:scale-110 transition-transform duration-500"
                  style={{ filter: "var(--stq-logo-filter)" }}
                />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-black text-scrutiq-dark tracking-tighter leading-none">
                Scrutiq
              </h2>
              <p className="text-[10px] font-bold text-scrutiq-blue tracking-[0.2em] uppercase mt-1">
                Advanced Talent Analysis
              </p>
            </div>
          </motion.div>

          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-scrutiq-dark tracking-tighter leading-[0.95] md:leading-[0.9] max-w-4xl mx-auto">
              Effortless Hiring <br />
              <span className="text-scrutiq-blue relative">
                Powered by AI
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-scrutiq-blue/20"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 25 0, 50 5 T 100 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-scrutiq-muted max-w-3xl mx-auto leading-relaxed font-medium">
              An advanced talent analysis platform that streamlines candidate
              screening and technical assessment for smarter hiring decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold tracking-[0.1em] text-scrutiq-muted/60 uppercase">
            <span className="flex items-center gap-2">
              <Zap className="size-3 text-amber-500" /> Instant Screening
            </span>
            <span className="size-1 bg-scrutiq-border rounded-full" />
            <span className="flex items-center gap-2">
              <Globe className="size-3 text-scrutiq-blue" /> Global Scale
            </span>
            <span className="size-1 bg-scrutiq-border rounded-full" />
            <span className="flex items-center gap-2">
              <Database className="size-3 text-purple-500" /> Secure Data
            </span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link href="/dashboard" className="w-full md:w-auto">
            <button className="group relative w-full md:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-scrutiq-blue to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
              <div className="relative btn-primary px-12 py-5 text-[14px] font-black tracking-widest flex items-center justify-center gap-3">
                <span>Enter Dashboard</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </Link>
          <Link href="/register" className="w-full md:w-auto">
            <button className="btn-secondary w-full md:w-auto px-12 py-5 text-[14px] font-black tracking-widest hover-lift">
              Create Account
            </button>
          </Link>
        </div>

        {/* Features Preview */}
        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: Briefcase,
              title: "Job Intelligence",
              desc: "Context-aware job management with AI optimization.",
            },
            {
              icon: Users,
              title: "Candidate Analysis",
              desc: "High-fidelity resume ingestion and skill mapping.",
            },
            {
              icon: ShieldCheck,
              title: "Verified Screening",
              desc: "Bias-free, AI-driven candidate ranking and verification.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-scrutiq-surface/50 backdrop-blur-xl border border-scrutiq-border p-8 rounded-[2rem] shadow-xl shadow-scrutiq-blue/5 flex flex-col items-center text-center group hover:bg-scrutiq-surface transition-all duration-500"
            >
              <div className="size-14 rounded-2xl bg-scrutiq-bg border border-scrutiq-border flex items-center justify-center text-scrutiq-blue mb-6 group-hover:scale-110 group-hover:bg-scrutiq-blue group-hover:text-white transition-all duration-500">
                <feature.icon className="size-7" />
              </div>
              <h3 className="text-lg font-black text-scrutiq-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-scrutiq-muted font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <footer className="mt-32 w-full max-w-5xl border-t border-scrutiq-border/30 pt-12 pb-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-3">
          <img
            src="/Untitled_design-removebg-preview.svg"
            alt="Scrutiq"
            className="size-8 opacity-50"
            style={{ filter: "var(--stq-logo-filter)" }}
          />
          <p className="text-[10px] font-black tracking-[0.2em] text-scrutiq-muted/40 uppercase">
            Scrutiq Intelligence &copy; 2026
          </p>
        </div>

        <div className="flex gap-8">
          {["Privacy", "Legal", "Security", "Status"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[10px] font-black tracking-widest text-scrutiq-muted/30 hover:text-scrutiq-blue transition-colors uppercase"
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
