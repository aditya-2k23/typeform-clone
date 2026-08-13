"use client";

import { useEffect } from "react";
import type { QuestionOut } from "@/lib/types";
import QuestionRenderer from "./QuestionRenderer";

interface PreviewPanelProps {
  question: QuestionOut | null;
  questionNumber: number;
  onClose: () => void;
}

export default function PreviewPanel({
  question,
  questionNumber,
  onClose,
}: PreviewPanelProps) {
  // Close preview on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Form preview mode"
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#111315] animate-in slide-in-from-bottom-4 duration-300"
    >
      {/* Top bar for preview */}
      <div className="flex h-14 items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 bg-white dark:bg-[#111315]">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 dark:bg-white text-xs font-bold text-white dark:text-gray-900">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor" />
              <rect x="2" y="7" width="8" height="2" rx="1" fill="currentColor" />
              <rect x="2" y="11" width="10" height="2" rx="1" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Preview Mode</span>
        </div>
        
        <button
          onClick={onClose}
          aria-label="Close preview mode (Escape)"
          className="rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden"
        >
          Close preview <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">Esc</span>
        </button>
      </div>

      {/* Main preview area */}
      <div className="flex-1 overflow-y-auto">
        {question ? (
          <QuestionRenderer
            question={question}
            questionNumber={questionNumber}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Select a question to preview
          </div>
        )}
      </div>
    </div>
  );
}
