"use client";

import { useState, useEffect } from "react";
import { X, Send, Mail, User, BookOpen, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

interface ContactModalProps {
  applicant: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({
  applicant,
  isOpen,
  onClose,
}: ContactModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (applicant) {
      setCustomEmail(applicant.email || "");
      if (applicant.screening) {
        setSubject(`Feedback on your recent application`);
        setMessage(
          `Hello ${applicant.name},\n\n` +
            `Thank you for your interest. We've conducted an initial review of your technical profile.\n\n` +
            `Alignment Score: ${applicant.screening.matchScore}/100\n` +
            `Status: ${applicant.screening.finalRecommendation}\n\n` +
            `Key Feedback:\n${applicant.screening.reasoning}\n\n` +
            `We will keep you informed of any next steps.\n\n` +
            `Best regards,\nThe Hiring Team`,
        );
      } else {
        setSubject(`Next steps: Technical Interview with Scrutiq`);
        setMessage(
          `Hello ${applicant.name || "there"},\n\nWe found your technical profile to be a strong alignment with our requirements. We would like to schedule a formal discussion regarding your experience.`,
        );
      }
    }
  }, [applicant]);

  const handleSend = async () => {
    if (!subject || !message) {
      toast.error("Please provide both a subject and a message.");
      return;
    }

    setIsSending(true);
    try {
      await api.post(`/applicants/${applicant._id}/email`, {
        subject,
        message,
        recipientEmail: customEmail,
      });
      toast.success("Email sent successfully.");
      onClose();
    } catch (error) {
      toast.error("Failed to send email. Check your email settings.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-scrutiq-dark/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-scrutiq-surface rounded-3xl shadow-2xl overflow-hidden border border-scrutiq-border"
          >
            <div className="p-8 border-b border-scrutiq-border flex items-center justify-between bg-scrutiq-bg/30">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-scrutiq-blue flex items-center justify-center text-white shadow-lg shadow-scrutiq-blue/20">
                  <Mail className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-scrutiq-dark tracking-tight">
                    Send Email
                  </h2>
                  <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest uppercase">
                    To {applicant?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-scrutiq-surface rounded-xl transition-all border border-transparent hover:border-scrutiq-border"
              >
                <X className="size-5 text-scrutiq-muted" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-scrutiq-bg rounded-xl border border-scrutiq-border/50 focus-within:border-scrutiq-blue focus-within:ring-4 focus-within:ring-scrutiq-blue/5 transition-all">
                  <User className="size-4 text-scrutiq-blue" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="text-xs font-bold text-scrutiq-dark bg-transparent border-none outline-none w-full"
                    placeholder="Recipient email address"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-scrutiq-muted tracking-widest uppercase ml-1">
                    Subject line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="form-input"
                    placeholder="Enter subject..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-scrutiq-muted tracking-widest uppercase ml-1">
                    Message content
                  </label>
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-input resize-none"
                    placeholder="Write your message here..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-[10px] font-bold text-scrutiq-muted tracking-wide max-w-[240px]">
                  This email will be sent using your configured email settings.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="btn-secondary px-6"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="btn-primary px-8 flex items-center gap-2 shadow-xl shadow-scrutiq-blue/30 disabled:opacity-50"
                  >
                    {isSending ? (
                      <RefreshCcw className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    <span>{isSending ? "Sending..." : "Send message"}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
