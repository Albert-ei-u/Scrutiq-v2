"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  ShieldCheck,
  Briefcase,
  Search,
  Zap,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useNotifications } from "@/context/NotificationContext";
import { useChat, Message } from "@/context/ChatContext";

/* 
  High-Performance Robust Markdown Interpreter
  Structural Line Processor for AI-Generated Technical Narratives
  Extended to support: Tables, Headers, Bold, and Lists.
*/
const MarkdownLite = ({ text }: { text: string }) => {
  const processLine = (line: string) => {
    let formatted = line
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-black text-scrutiq-dark">$1</strong>',
      )
      .replace(/\*(.*?)\*/g, '<em class="italic text-scrutiq-dark">$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-scrutiq-bg px-1.5 py-0.5 rounded text-scrutiq-dark font-bold font-mono text-[11px]">$1</code>',
      );
    return formatted;
  };

  const lines = (text || "").split("\n");
  const elements: React.ReactNode[] = [];

  let currentTable: string[][] = [];

  const flushTable = (index: number) => {
    if (currentTable.length === 0) return;

    // Check if it's a real table (has header and separator)
    const hasSeparator = currentTable[1]?.some((cell) => cell.includes("---"));
    const tableData = hasSeparator
      ? [currentTable[0], ...currentTable.slice(2)]
      : currentTable;

    elements.push(
      <div
        key={`table-${index}`}
        className="overflow-x-auto my-4 border border-scrutiq-border rounded-xl shadow-md"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-scrutiq-bg border-b border-scrutiq-border">
              {tableData[0].map((cell, ci) => (
                <th
                  key={ci}
                  className="px-4 py-3 font-black text-scrutiq-dark uppercase tracking-wider"
                  dangerouslySetInnerHTML={{ __html: processLine(cell) }}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-scrutiq-border">
            {tableData.slice(1).map((row, ri) => (
              <tr
                key={ri}
                className="bg-scrutiq-surface hover:bg-scrutiq-hover transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-2.5 text-scrutiq-dark font-medium"
                    dangerouslySetInnerHTML={{ __html: processLine(cell) }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    currentTable = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Table Row Detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .filter((c) => c !== "")
        .map((c) => c.trim());
      currentTable.push(cells);
      return;
    } else {
      flushTable(i);
    }

    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      elements.push(
        <hr key={i} className="my-8 border-t-2 border-[#E2E8F0]" />,
      );
      return;
    }

    // Headers Support (# to ######)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const sizeClass =
        level === 1
          ? "text-xl"
          : level === 2
            ? "text-lg"
            : level === 3
              ? "text-[14px]"
              : "text-xs";

      elements.push(
        <h3
          key={i}
          className={`${sizeClass} font-black uppercase tracking-widest text-scrutiq-dark mt-6 pb-2 ${level <= 2 ? "border-b-2" : "border-b"} border-scrutiq-border`}
          dangerouslySetInnerHTML={{ __html: processLine(content) }}
        />,
      );
      return;
    }

    // Lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.substring(2);
      elements.push(
        <div key={i} className="flex gap-4 pl-3 items-start group">
          <span className="text-scrutiq-dark mt-2 w-2 h-2 rounded-full bg-scrutiq-dark shrink-0 border border-scrutiq-border shadow-sm" />
          <div
            className="text-[14px] leading-relaxed text-scrutiq-dark font-medium"
            dangerouslySetInnerHTML={{ __html: processLine(content) }}
          />
        </div>,
      );
      return;
    }

    // Standard Paragraph
    elements.push(
      <div
        key={i}
        className="text-[14px] leading-relaxed text-scrutiq-dark font-medium"
        dangerouslySetInnerHTML={{ __html: processLine(line) }}
      />,
    );
  });

  flushTable(lines.length);

  return <div className="space-y-4">{elements}</div>;
};

const ChatPage = () => {
  const { notify } = useNotifications();
  const { messages, addMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: input };
    addMessage(userMsg);
    setInput("");
    setIsTyping(true);

    try {
      const response = await api.post("/chat/message", {
        message: input,
        history: messages,
      });

      if (response.data.status === "success") {
        addMessage(response.data.data);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Unable to contact the central brain.";
      notify(`AI Sync Fault: ${errorMsg}`, "error");
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 3000); // Reset after 3 seconds
      return;
    }
    clearChat();
    setIsConfirmingClear(false);
    notify("Conversation memory flushed.", "success");
  };

  return (
    <div className="absolute inset-[5px] flex flex-col animate-in fade-in duration-700">
      {/* Main Chat Area */}
      <div className="flex-1 bg-scrutiq-surface rounded-3xl border border-scrutiq-border shadow-sm flex flex-col overflow-hidden relative">
        {/* Compact Header */}
        <div className="px-6 py-3 border-b border-scrutiq-border/50 flex items-center justify-between bg-scrutiq-surface/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-scrutiq-blue/10 flex items-center justify-center">
              <Bot className="size-5 text-scrutiq-blue" />
            </div>
            <div>
              <h2 className="text-[11px] font-black text-scrutiq-dark uppercase tracking-widest">
                Scrutiq AI Assistant
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-scrutiq-muted uppercase tracking-widest">
                  Active System
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all uppercase tracking-widest ${
              isConfirmingClear
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "text-scrutiq-muted hover:text-rose-500 hover:bg-rose-50"
            }`}
          >
            <Trash2
              className={`size-3 ${isConfirmingClear ? "animate-bounce" : ""}`}
            />
            {isConfirmingClear ? "Confirm Clear?" : "Clear Memory"}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`size-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm border ${
                    msg.role === "user"
                      ? "bg-scrutiq-surface border-scrutiq-border text-scrutiq-dark"
                      : "bg-scrutiq-blue border-scrutiq-blue text-white"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="size-5" />
                  ) : (
                    <Bot className="size-5" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] md:max-w-[75%] overflow-hidden ${
                    msg.role === "user" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div
                    className={`px-5 py-3.5 rounded-2xl shadow-sm border ${
                      msg.role === "user"
                        ? "bg-scrutiq-bg text-scrutiq-dark border-scrutiq-border rounded-tr-sm"
                        : "bg-scrutiq-surface text-scrutiq-dark border-scrutiq-border rounded-tl-sm"
                    }`}
                  >
                    <MarkdownLite text={msg.content} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex gap-4 items-center">
              <div className="size-10 rounded-xl bg-scrutiq-blue flex items-center justify-center">
                <Bot className="size-5 text-white" />
              </div>
              <div className="bg-scrutiq-bg px-5 py-3 rounded-2xl border border-scrutiq-border/50 flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-scrutiq-blue" />
                <span className="text-[10px] font-black text-scrutiq-muted uppercase tracking-widest">
                  THINKING
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 pt-2 md:p-8 md:pt-4 bg-scrutiq-surface relative z-10">
          <div className="w-full px-0 sm:px-14">
            <div className="flex items-end gap-3 bg-scrutiq-bg border border-scrutiq-border rounded-2xl p-2 focus-within:border-scrutiq-blue focus-within:ring-4 focus-within:ring-scrutiq-blue/5 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me to rank candidates, trigger screenings, or listing active jobs..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-scrutiq-dark px-4 py-3 placeholder:text-scrutiq-muted/50 resize-none max-h-[120px] custom-scrollbar"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-scrutiq-blue text-white p-3.5 rounded-xl shadow-lg shadow-scrutiq-blue/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 mb-0.5"
              >
                {isTyping ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Send className="size-5" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              <button
                onClick={() =>
                  setInput(
                    "I want to screen candidates for a job. Please help me initiate the protocol.",
                  )
                }
                className="flex items-center gap-1.5 text-[9px] font-black text-scrutiq-muted uppercase tracking-widest bg-scrutiq-bg px-2.5 py-1.5 rounded-md border border-scrutiq-border/50 hover:bg-scrutiq-blue/10 hover:text-scrutiq-blue hover:border-scrutiq-blue/30 transition-all active:scale-95"
              >
                <ShieldCheck className="size-3 text-scrutiq-blue" /> Screen
                Candidates
              </button>
              <button
                onClick={() =>
                  setInput("List all active jobs from our registry.")
                }
                className="flex items-center gap-1.5 text-[9px] font-black text-scrutiq-muted uppercase tracking-widest bg-scrutiq-bg px-2.5 py-1.5 rounded-md border border-scrutiq-border/50 hover:bg-scrutiq-blue/10 hover:text-scrutiq-blue hover:border-scrutiq-blue/30 transition-all active:scale-95"
              >
                <Briefcase className="size-3 text-scrutiq-blue" /> List Jobs
              </button>
              <button
                onClick={() =>
                  setInput(
                    "I need to modify the judging criteria for a job posting.",
                  )
                }
                className="flex items-center gap-1.5 text-[9px] font-black text-scrutiq-muted uppercase tracking-widest bg-scrutiq-bg px-2.5 py-1.5 rounded-md border border-scrutiq-border/50 hover:bg-scrutiq-blue/10 hover:text-scrutiq-blue hover:border-scrutiq-blue/30 transition-all active:scale-95"
              >
                <Activity className="size-3 text-scrutiq-blue" /> Modify
                Criteria
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
