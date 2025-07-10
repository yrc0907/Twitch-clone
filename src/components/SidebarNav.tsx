"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  showLabel?: boolean;
}

interface SidebarNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function SidebarNav({ collapsed, onToggle }: SidebarNavProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we have correct SSR/CSR matching
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect width="20" height="20" x="2" y="2" rx="2" ry="2" />
          <path d="M9 22V12h6v10" />
        </svg>
      )
    },
    {
      href: "/dashboard/stream",
      label: "Stream",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect width="18" height="14" x="3" y="5" rx="2" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      )
    },
    {
      href: "/dashboard/keys",
      label: "Keys",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M15.5 7.5 19 4" />
          <path d="M8.5 7.5 5 4" />
          <path d="M13 14a3 3 0 1 0 0-6H9a3 3 0 0 0 0 6" />
          <path d="M9 11v3" />
          <path d="M13 11v3" />
          <path d="M21 8v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5Z" />
        </svg>
      )
    },
    {
      href: "/dashboard/chat",
      label: "Chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
        </svg>
      )
    },
    {
      href: "/dashboard/community",
      label: "Community",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  if (!isMounted) {
    return <div className="flex-1 py-8"></div>;
  }

  return (
    <nav className="flex-1 py-4">
      <button
        onClick={onToggle}
        className="mb-4 w-full flex justify-center md:justify-end px-4 py-2 text-gray-300 hover:text-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
          {collapsed
            ? <path d="m9 18 6-6-6-6" /> // right arrow when collapsed
            : <path d="m15 18-6-6 6-6" /> // left arrow when expanded
          }
        </svg>
      </button>

      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 gap-3 ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
} 