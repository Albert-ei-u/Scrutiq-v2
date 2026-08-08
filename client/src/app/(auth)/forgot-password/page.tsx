"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  RefreshCcw,
  User,
  Building,
  Fingerprint,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import PasswordRequirements from "@/components/auth/PasswordRequirements";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    pin: "",
    password: "",
  });

  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email: formData.email },
      );
      if (response.data.status === "success") {
        toast.success(response.data.message);
        setStep(2);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Fault in communication. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/verify-reset-pin`,
        {
          email: formData.email,
          pin: formData.pin,
        },
      );
      if (response.data.status === "success") {
        toast.success("Identity verified. You can now reset your credentials.");
        setStep(3);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid or expired PIN.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email: formData.email,
        pin: formData.pin,
        password: formData.password,
      });
      if (response.data.status === "success") {
        toast.success("Security credentials updated! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to finalize recovery.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-scrutiq-bg flex flex-col items-center justify-center p-6 relative overflow-hidden font-jakarta">
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
            <h1 className="text-4xl font-black text-scrutiq-dark tracking-tighter leading-none uppercase">
              Recovery
            </h1>
            <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest mt-2 uppercase">
              Secure Account Restoration
            </p>
          </div>
        </div>

        <div className="admin-card p-10 bg-scrutiq-surface shadow-2xl relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-scrutiq-bg flex">
            <div
              className="h-full bg-scrutiq-blue transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendPin}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-scrutiq-dark tracking-widest uppercase">
                    1. Identify Account
                  </h2>
                  <p className="text-[10px] text-scrutiq-muted font-bold leading-relaxed uppercase tracking-wider">
                    Enter the email associated with your recruiter account.
                  </p>
                </div>

                <div className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-scrutiq-blue/20"
                >
                  {isLoading ? (
                    <RefreshCcw className="size-5 animate-spin" />
                  ) : (
                    <>
                      {" "}
                      <span className="text-[11px] font-black tracking-widest uppercase">
                        Get recovery PIN
                      </span>{" "}
                      <ArrowRight className="size-4" />{" "}
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyPin}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-scrutiq-dark tracking-widest uppercase">
                    2. Verify Identity
                  </h2>
                  <p className="text-[10px] text-scrutiq-muted font-bold leading-relaxed uppercase tracking-wider">
                    We sent a 6-digit PIN to{" "}
                    <span className="text-scrutiq-blue">{formData.email}</span>.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative flex items-center group">
                    <Fingerprint className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000000"
                      value={formData.pin}
                      onChange={(e) =>
                        setFormData({ ...formData, pin: e.target.value })
                      }
                      className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-4 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue focus:ring-4 focus:ring-scrutiq-blue/5 transition-all text-center tracking-[1em]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-scrutiq-blue/20"
                  >
                    {isLoading ? (
                      <RefreshCcw className="size-5 animate-spin" />
                    ) : (
                      <>
                        {" "}
                        <span className="text-[11px] font-black tracking-widest uppercase">
                          Verify PIN
                        </span>{" "}
                        <ArrowRight className="size-4" />{" "}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[9px] font-black text-scrutiq-muted hover:text-scrutiq-dark uppercase tracking-widest transition-colors text-center py-2 underline underline-offset-4"
                  >
                    Incorrect email? Change it
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (formData.password !== confirmPassword) {
                    toast.error("Security mismatch: Passwords do not match.");
                    return;
                  }
                  handleResetPassword(e);
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-scrutiq-dark tracking-widest uppercase">
                    3. New Credentials
                  </h2>
                  <p className="text-[10px] text-scrutiq-muted font-bold leading-relaxed uppercase tracking-wider">
                    Securely set your new account access password.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-scrutiq-muted tracking-widest ml-1 uppercase">
                      New password
                    </label>
                    <div className="relative flex items-center group">
                      <Lock className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Input"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-12 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue transition-all tracking-[0.3em]"
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
                    <label className="text-[9px] font-black text-scrutiq-muted tracking-widest ml-1 uppercase">
                      Confirm password
                    </label>
                    <div className="relative flex items-center group">
                      <Lock className="size-4 absolute left-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-scrutiq-bg border border-scrutiq-border rounded-xl pl-11 pr-12 py-3.5 text-xs font-bold text-scrutiq-dark outline-none focus:border-scrutiq-blue transition-all tracking-[0.3em]"
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

                  <PasswordRequirements
                    password={formData.password}
                    confirmPassword={confirmPassword}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-scrutiq-blue/20 mt-4"
                >
                  {isLoading ? (
                    <RefreshCcw className="size-5 animate-spin" />
                  ) : (
                    <>
                      {" "}
                      <span className="text-[11px] font-black tracking-widest uppercase">
                        Reset & Login
                      </span>{" "}
                      <ArrowRight className="size-4" />{" "}
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-[10px] font-black text-scrutiq-muted tracking-widest hover:text-scrutiq-dark transition-colors uppercase"
          >
            ← Cancel and return to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
