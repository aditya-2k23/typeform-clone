"use client";

import { useRef, useEffect } from "react";

interface OptionEditorProps {
  options: { label: string; order: number }[];
  onChange: (options: { label: string; order: number }[]) => void;
}

export default function OptionEditor({ options, onChange }: OptionEditorProps) {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const focusIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (focusIndexRef.current !== null && inputsRef.current[focusIndexRef.current]) {
      inputsRef.current[focusIndexRef.current]?.focus();
      focusIndexRef.current = null;
    }
  }, [options.length]);

  function updateLabel(index: number, label: string) {
    const updated = [...options];
    updated[index] = { ...updated[index], label };
    onChange(updated);
  }

  function removeOption(index: number) {
    if (options.length <= 1) return; // Keep at least one option
    const updated = options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({ ...opt, order: i }));
    focusIndexRef.current = Math.max(0, index - 1);
    onChange(updated);
  }

  function addOption(afterIndex?: number) {
    const insertIdx = afterIndex !== undefined ? afterIndex + 1 : options.length;
    const newOptions = [...options];
    newOptions.splice(insertIdx, 0, { label: "", order: insertIdx });
    const reindexed = newOptions.map((opt, i) => ({ ...opt, order: i }));
    focusIndexRef.current = insertIdx;
    onChange(reindexed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption(index);
    } else if (e.key === "Backspace" && options[index]?.label === "" && options.length > 1) {
      e.preventDefault();
      removeOption(index);
    } else if (e.key === "ArrowDown" && index < options.length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Options
        </label>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          Press <kbd className="font-mono font-semibold">Enter ↵</kbd> to add option
        </span>
      </div>

      <div className="space-y-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Letter prefix */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181a1d] text-xs font-semibold text-gray-400 dark:text-gray-400">
              {LETTERS[i] ?? i + 1}
            </span>

            {/* Option text input */}
            <input
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              value={opt.label}
              onChange={(e) => updateLabel(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              placeholder={`Option ${i + 1}`}
              aria-label={`Option ${i + 1}`}
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181a1d] px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus-visible:outline-hidden"
            />

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removeOption(i)}
              disabled={options.length <= 1}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-hidden"
              aria-label={`Remove option ${i + 1}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add option */}
      <button
        type="button"
        onClick={() => addOption()}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M7 3v8M3 7h8" />
        </svg>
        Add option
      </button>
    </div>
  );
}
