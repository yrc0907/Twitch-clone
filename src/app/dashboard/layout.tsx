"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import SidebarNav from "@/components/SidebarNav";
import BackButton from "@/components/BackButton";
import LogoutButton from "@/components/LogoutButton";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      // Auto-collapse on mobile
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Don't render until we're mounted to avoid hydration issues
  if (!mounted || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Overlay for mobile when sidebar is open */}
      {isMobileView && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          flex flex-col border-r border-gray-800
          fixed md:relative h-full z-30
          transition-all duration-300 ease-in-out
          ${isMobileView && sidebarCollapsed ? '-ml-16' : ''}
        `}
      >
        {/* Logo */}
        <div className={`p-4 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 bg-black rounded-full"></div>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold">Gamehub</h1>
              <p className="text-sm text-gray-400">Creator dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarNav collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col 
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-0'}
        ${isMobileView ? 'ml-0' : ''}
        w-full md:w-auto
      `}>
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {isMobileView && sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-300 hover:text-white"
                aria-label="Open sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <BackButton />
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {session?.user?.name?.[0] || session?.user?.username?.[0] || 'Y'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 