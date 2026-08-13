"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key and auto focus confirm button
  useEffect(() => {
    confirmBtnRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#181a1d] border border-gray-100 dark:border-gray-800 p-7 shadow-2xl animate-in fade-in zoom-in-95">
        <h2 id="confirm-dialog-title" className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-hidden"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 dark:bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-hidden"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
