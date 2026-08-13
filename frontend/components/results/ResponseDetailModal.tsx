"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { ResponseDetail } from "@/lib/types";

interface ResponseDetailModalProps {
  formId: string;
  responseId: string;
  onClose: () => void;
}

export default function ResponseDetailModal({
  formId,
  responseId,
  onClose,
}: ResponseDetailModalProps) {
  const [detail, setDetail] = useState<ResponseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await apiFetch<ResponseDetail>(
          `/forms/${formId}/responses/${responseId}`
        );
        setDetail(data);
      } catch {
        setError("Failed to load response details");
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [formId, responseId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl animate-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Response Details
            </h3>
            {detail && (
              <p className="text-xs text-gray-400">
                Submitted{" "}
                {new Date(detail.submitted_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
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
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {detail && detail.answers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No answers recorded for this response.
            </p>
          )}

          {detail && (
            <div className="divide-y divide-gray-100">
              {detail.answers.map((ans, idx) => (
                <div key={ans.question_id || idx} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Question {idx + 1} • {ans.question_type}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {ans.question_title}
                  </p>
                  <div className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 font-medium">
                    {ans.value || <span className="text-gray-400 italic">No answer provided</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
