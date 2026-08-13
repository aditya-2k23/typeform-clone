"use client";

import { useState } from "react";
import type { ResponseListItem } from "@/lib/types";
import ResponseDetailModal from "./ResponseDetailModal";

interface ResponsesTabProps {
  formId: string;
  responses: ResponseListItem[];
  loading: boolean;
}

export default function ResponsesTab({
  formId,
  responses,
  loading,
}: ResponsesTabProps) {
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null
  );

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <h3 className="mb-1 text-base font-semibold text-gray-900">
          No responses yet
        </h3>
        <p className="max-w-sm text-sm text-gray-500">
          Responses will appear here as soon as respondents start filling out your form.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">Submitted At</div>
            <div className="col-span-8">Answer Preview</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {responses.map((resp, idx) => (
            <div
              key={resp.id}
              onClick={() => setSelectedResponseId(resp.id)}
              className="grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/80 cursor-pointer"
            >
              {/* Submission Date/Time */}
              <div className="col-span-3">
                <p className="text-sm font-semibold text-gray-900">
                  Response #{responses.length - idx}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(resp.submitted_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              {/* Answers Preview */}
              <div className="col-span-8 flex flex-wrap items-center gap-2">
                {resp.preview && resp.preview.length > 0 ? (
                  resp.preview.map((ans, aIdx) => (
                    <div
                      key={aIdx}
                      className="max-w-[220px] truncate rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                      title={`${ans.question_title}: ${ans.value}`}
                    >
                      <span className="font-medium text-gray-900">
                        {ans.value || "—"}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    No preview available
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedResponseId(resp.id);
                  }}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-800"
                  aria-label="View response details"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 3 11 8 6 13" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedResponseId && (
        <ResponseDetailModal
          formId={formId}
          responseId={selectedResponseId}
          onClose={() => setSelectedResponseId(null)}
        />
      )}
    </>
  );
}
