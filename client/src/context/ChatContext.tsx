"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = "umurava_chat_history_v1";

const INITIAL_MESSAGE: Message = {
  role: "model",
  content: "Protocol Initiated. I am the Scrutiq AI Agent. How can I assist your recruitment operations today?",
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history", e);
        setMessages([INITIAL_MESSAGE]);
      }
    } else {
      setMessages([INITIAL_MESSAGE]);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setMessages(parsed);
          } catch (err) {
            console.error("Failed to sync chat history across tabs", err);
          }
        } else {
          // Storage cleared
          setMessages([INITIAL_MESSAGE]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);


  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: "model",
        content: "Memory Purged. Systems Reset. How can I assist you now?",
      },
    ]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
