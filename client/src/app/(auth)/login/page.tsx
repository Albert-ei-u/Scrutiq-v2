"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  RefreshCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      if (response.data.status === "success") {
        toast.success("Welcome back! Loading your dashboard...");
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        setTimeout(() => router.push("/dashboard"), 1000);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-scrutiq-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] size-96 bg-scrutiq-blue/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] size-96 bg-emerald-500/5 rounded-full blur-3xl opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="size-16 bg-scrutiq-blue rounded-2xl flex items-center justify-center shadow-xl shadow-scrutiq-blue/20 mx-auto">
            <ShieldCheck className="size-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-scrutiq-dark tracking-tighter leading-none">
              Scrutiq
            </h1>
            <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest mt-2">
              Sign in to your recruiter portal
            </p>
          </div>
        </div>

        <div className="admin-card p-10 bg-scrutiq-surface shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-scrutiq-muted tracking-widest ml-1">
                Work email
              </label>
              <div className="relative flex items-center group">
                <Mail className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-4 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue focus:ring-4 focus:ring-scrutiq-blue/5 transition-all tracking-wider"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-scrutiq-muted tracking-widest ml-1">
                Password
              </label>
              <div className="relative flex items-center group">
                <Lock className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-12 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue focus:ring-4 focus:ring-scrutiq-blue/5 transition-all tracking-[0.3em]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-scrutiq-muted hover:text-scrutiq-blue transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end pr-1">
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-black text-scrutiq-muted hover:text-scrutiq-blue uppercase tracking-widest transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-scrutiq-blue/20 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCcw className="size-5 animate-spin" />
              ) : (
                <>
                  <span className="text-[13px] font-black tracking-widest">
                    Sign in
                  </span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-scrutiq-border/50 text-center">
            <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest">
              Don&apos;t have an account yet?
              <Link
                href="/register"
                className="text-scrutiq-blue ml-2 hover:underline"
              >
                Register your company
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-[10px] font-black text-scrutiq-muted tracking-widest hover:text-scrutiq-dark transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
