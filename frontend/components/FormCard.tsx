"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FormListItem } from "@/lib/types";

interface FormCardProps {
  form: FormListItem;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, currentStatus: string) => void;
}

export default function FormCard({
  form,
  onDuplicate,
  onDelete,
  onTogglePublish,
}: FormCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const updatedDate = new Date(form.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isPublished = form.status === "published";

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-gray-100 bg-white p-6 transition-all hover:border-gray-200 hover:shadow-lg cursor-pointer"
      onClick={() => router.push(`/forms/${form.id}/builder`)}
    >
      {/* Top row: title + menu */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2">
          {form.title}
        </h3>

        {/* "..." menu button */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 opacity-0 transition-all hover:bg-gray-50 hover:text-gray-600 group-hover:opacity-100 data-[open=true]:opacity-100"
            data-open={menuOpen}
            aria-label="Form actions"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl animate-in fade-in slide-in-from-top-1">
              <MenuItem
                label="Edit"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/forms/${form.id}/builder`);
                }}
              />
              <MenuItem
                label="Duplicate"
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(form.id);
                }}
              />
              <MenuItem
                label={isPublished ? "Unpublish" : "Publish"}
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePublish(form.id, form.status);
                }}
              />
              <div className="my-1 border-t border-gray-100" />
              <MenuItem
                label="Delete"
                danger
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(form.id);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isPublished
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isPublished ? "bg-emerald-500" : "bg-gray-400"
            }`}
          />
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-auto flex items-center gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M7 3.5v3.5l2.5 1.5" />
            <circle cx="7" cy="7" r="5.5" />
          </svg>
          {updatedDate}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4.5h8M3 7h5M3 9.5h6.5" />
          </svg>
          {form.response_count} response{form.response_count !== 1 && "s"}
        </span>
      </div>
    </div>
  );
}

/* ── Small helper: dropdown menu item ─────────────────────────────────── */

function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex w-full items-center px-4 py-2 text-[13px] transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}
