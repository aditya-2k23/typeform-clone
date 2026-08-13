"use client";

import { useState, useRef, useEffect } from "react";
import { QUESTION_TYPES } from "@/lib/question-types";

interface QuestionTypePickerProps {
  onSelect: (type: string) => void;
}

export default function QuestionTypePicker({
  onSelect,
}: QuestionTypePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
        Add question
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-30 mb-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e2124] p-2 shadow-xl animate-in">
          <p className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Question type
          </p>
          <div className="grid grid-cols-2 gap-1">
            {QUESTION_TYPES.map((qt) => (
              <button
                key={qt.type}
                onClick={() => {
                  setOpen(false);
                  onSelect(qt.type);
                }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span className="shrink-0 text-gray-400 dark:text-gray-500">{qt.icon}</span>
                <span className="font-medium">{qt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
