"use client";

import { useEffect, useState } from "react";

export interface ToastData {
  message: string;
  type: "success" | "error";
}

interface ToastProps extends ToastData {
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  durationMs = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200); // Wait for exit animation
    }, durationMs);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [durationMs, onClose]);

  const bgColor =
    type === "success"
      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xl"
      : "bg-red-600 text-white dark:bg-red-500 dark:text-white shadow-xl";

  const icon =
    type === "success" ? (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    ) : (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3.5M8 10.5v.5" />
      </svg>
    );

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition-all duration-200 ${bgColor} ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      }`}
    >
      {icon}
      {message}
    </div>
  );
}
