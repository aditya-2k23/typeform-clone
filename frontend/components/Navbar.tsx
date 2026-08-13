"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#111315]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo / App name */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* Simple icon mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor" />
              <rect x="2" y="7" width="8" height="2" rx="1" fill="currentColor" />
              <rect x="2" y="11" width="10" height="2" rx="1" fill="currentColor" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Typeform Clone
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
