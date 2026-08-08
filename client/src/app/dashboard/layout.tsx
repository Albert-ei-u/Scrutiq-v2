"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import { NotificationProvider } from "@/context/NotificationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <NotificationProvider>
        <div className="flex h-screen overflow-hidden bg-scrutiq-bg">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-scrutiq-dark/30 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Container */}
          <div
            className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Main Content */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8 custom-scrollbar relative">
              {children}
            </main>
          </div>
        </div>
      </NotificationProvider>
    </AuthGuard>
  );
}
