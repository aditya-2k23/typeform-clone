"use client";

import { useState, useEffect } from "react";

interface ShareModalProps {
  slug: string;
  title?: string;
  onClose: () => void;
}

export default function ShareModal({
  slug,
  title = "Your typeform is live!",
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const publicPath = `/public/forms/${slug}`;
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${publicPath}`
      : publicPath;

  // Escape key closes modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleCopy() {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#181a1d] border border-gray-100 dark:border-gray-800 p-7 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Success / Share Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 id="share-modal-title" className="mb-1.5 text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Anyone with this link can view and submit responses.
        </p>

        {/* Link input with 1-click copy */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111315] p-2 text-sm">
          <input
            type="text"
            readOnly
            value={fullUrl}
            onFocus={(e) => e.target.select()}
            aria-label="Public form URL"
            className="flex-1 bg-transparent px-2 text-xs font-mono text-gray-700 dark:text-gray-300 outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-xs border ${
              copied
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            } focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-hidden"
          >
            Done
          </button>
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900 transition-colors hover:bg-gray-800 dark:hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden"
          >
            Open form
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h7v7M13 3L6 10" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
