"use client";

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
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom-4 duration-300">
      {/* Top bar for preview */}
      <div className="flex h-14 items-center justify-between border-b border-gray-100 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-xs font-bold text-white">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="3" width="12" height="2" rx="1" fill="white" />
              <rect x="2" y="7" width="8" height="2" rx="1" fill="white" />
              <rect x="2" y="11" width="10" height="2" rx="1" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">Preview Mode</span>
        </div>
        
        <button
          onClick={onClose}
          className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          Close preview
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
