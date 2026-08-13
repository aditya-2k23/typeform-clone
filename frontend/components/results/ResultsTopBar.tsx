"use client";

import Link from "next/link";

interface ResultsTopBarProps {
  formId: string;
  formTitle: string;
  activeTab: "summary" | "responses";
  onTabChange: (tab: "summary" | "responses") => void;
}

export default function ResultsTopBar({
  formId,
  formTitle,
  activeTab,
  onTabChange,
}: ResultsTopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6">
      {/* Left — back to dashboard */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
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

        <span className="max-w-[200px] sm:max-w-xs truncate text-sm font-medium text-gray-900">
          {formTitle}
        </span>
      </div>

      {/* Center — Tab switcher */}
      <div className="flex items-center rounded-lg bg-gray-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => onTabChange("summary")}
          className={`rounded-md px-4 py-1.5 transition-all ${
            activeTab === "summary"
              ? "bg-white text-gray-900 shadow-xs font-semibold"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Summary
        </button>
        <button
          type="button"
          onClick={() => onTabChange("responses")}
          className={`rounded-md px-4 py-1.5 transition-all ${
            activeTab === "responses"
              ? "bg-white text-gray-900 shadow-xs font-semibold"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Responses
        </button>
      </div>

      {/* Right — Link back to Builder */}
      <div className="flex items-center">
        <Link
          href={`/forms/${formId}/builder`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 2l3 3-9 9H2v-3l9-9z" />
          </svg>
          Edit Form
        </Link>
      </div>
    </header>
  );
}
