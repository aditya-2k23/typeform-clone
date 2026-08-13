"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { FormDetail } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";

interface BuilderTopBarProps {
  form: FormDetail;
  saveStatus: "saved" | "saving" | "error";
  onTitleChange: (title: string) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreview: () => void;
}

export default function BuilderTopBar({
  form,
  saveStatus,
  onTitleChange,
  onPublish,
  onUnpublish,
  onPreview,
}: BuilderTopBarProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(form.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when form prop changes (e.g. after an external save)
  useEffect(() => {
    if (!editing) setTitle(form.title);
  }, [form.title, editing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function handleSave() {
    setEditing(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== form.title) {
      onTitleChange(trimmed);
    } else {
      setTitle(form.title); // revert if empty
    }
  }

  const isPublished = form.status === "published";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111315] px-4">
      {/* Left — back arrow */}
      <Link
        href="/"
        className="mr-4 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        aria-label="Back to dashboard"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 4l-6 6 6 6" />
        </svg>
      </Link>

      {/* Center — inline-editable title */}
      <div className="flex flex-1 items-center justify-center gap-3">
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setTitle(form.title);
                setEditing(false);
              }
            }}
            className="w-80 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-center text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-400"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="max-w-sm truncate rounded-lg px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
            title="Click to edit form title"
          >
            {form.title}
          </button>
        )}

        {/* Save status */}
        <span
          className={`text-xs transition-colors ${
            saveStatus === "saving"
              ? "text-amber-500"
              : saveStatus === "error"
                ? "text-red-500"
                : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {saveStatus === "saving"
            ? "Saving…"
            : saveStatus === "error"
              ? "Error saving"
              : "Saved"}
        </span>
      </div>

      {/* Right — ThemeToggle + Results + Preview + Publish */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Link
          href={`/forms/${form.id}/results`}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          Results
        </Link>

        <button
          onClick={onPreview}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          Preview
        </button>

        {isPublished ? (
          <button
            onClick={onUnpublish}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Unpublish
          </button>
        ) : (
          <button
            onClick={onPublish}
            className="rounded-lg bg-gray-900 dark:bg-white px-5 py-2 text-sm font-medium text-white dark:text-gray-900 transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Publish
          </button>
        )}
      </div>
    </header>
  );
}
