"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import PasswordRequirements from "@/components/auth/PasswordRequirements";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const RegisterPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        companyName: formData.companyName,
        password: formData.password,
      });

      if (response.data.status === "success") {
        setStep("verify");
        toast.success("Activation code sent to your email!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, {
        code: verificationCode,
      });

      if (response.data.status === "success") {
        toast.success("Account activated! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-scrutiq-bg flex flex-col items-center justify-center p-6 relative overflow-hidden text-scrutiq-muted">
      <div className="absolute top-[-10%] right-[-10%] size-96 bg-scrutiq-blue/5 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] size-96 bg-purple-500/5 rounded-full blur-3xl opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="size-16 bg-scrutiq-blue rounded-2xl flex items-center justify-center shadow-xl shadow-scrutiq-blue/20 mx-auto">
            <ShieldCheck className="size-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-scrutiq-dark tracking-tighter leading-none">
              {step === "register" ? "Create account" : "Verify email"}
            </h1>
            <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest mt-2 px-10">
              {step === "register"
                ? "Join Scrutiq to start screening your technical talent"
                : `Enter the 6-digit activation code sent to ${formData.email}`}
            </p>
          </div>
        </div>

        <div className="admin-card p-10 bg-scrutiq-surface shadow-2xl">
          <AnimatePresence mode="wait">
            {step === "register" ? (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegister}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest ml-1">
                    Full name
                  </label>
                  <div className="relative flex items-center group">
                    <User className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="Full name ..."
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-4 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue focus:ring-4 focus:ring-scrutiq-blue/5 transition-all tracking-wider"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest ml-1">
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

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black tracking-widest ml-1">
                    Company name
                  </label>
                  <div className="relative flex items-center group">
                    <Building2 className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="Technical Solutions Ltd"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-4 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue focus:ring-4 focus:ring-scrutiq-blue/5 transition-all tracking-wider"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest ml-1">
                    Password
                  </label>
                  <div className="relative flex items-center group">
                    <Lock className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password "
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
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest ml-1">
                    Confirm password
                  </label>
                  <div className="relative flex items-center group">
                    <Lock className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirm "
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-12 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue focus:ring-4 focus:ring-scrutiq-blue/5 transition-all tracking-[0.3em]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 text-scrutiq-muted hover:text-scrutiq-blue transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <PasswordRequirements
                    password={formData.password}
                    confirmPassword={formData.confirmPassword}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="md:col-span-2 btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-scrutiq-blue/20 disabled:opacity-50 mt-4"
                >
                  {isLoading ? (
                    <RefreshCcw className="size-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-[13px] font-black tracking-widest">
                        Register account
                      </span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest ml-1 text-center block">
                    Verification code
                  </label>
                  <div className="relative flex items-center group max-w-[240px] mx-auto">
                    <Hash className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000 000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-4 py-4 text-center text-lg font-black text-scrutiq-dark outline-none focus:border-scrutiq-blue focus:ring-4 focus:ring-scrutiq-blue/5 transition-all tracking-[0.5em]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length < 6}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-scrutiq-blue/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCcw className="size-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-[13px] font-black tracking-widest">
                        Activate account
                      </span>
                      <CheckCircle2 className="size-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-[10px] font-black text-scrutiq-blue tracking-widest hover:underline"
                  >
                    Wrong details? Go back
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-scrutiq-border/50 text-center">
            <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest">
              Already have a portal account?
              <Link
                href="/login"
                className="text-scrutiq-blue ml-2 hover:underline"
              >
                Sign in to your dashboard
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

export default RegisterPage;
