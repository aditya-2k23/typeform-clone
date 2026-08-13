"use client";

import type { QuestionStat } from "@/lib/types";
import { QUESTION_TYPE_MAP } from "@/lib/question-types";

interface QuestionStatCardProps {
  stat: QuestionStat;
  index: number;
  totalResponses: number;
}

export default function QuestionStatCard({
  stat,
  index,
  totalResponses,
}: QuestionStatCardProps) {
  const typeConfig = QUESTION_TYPE_MAP[stat.question_type];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-500">
            {index + 1}
          </span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {stat.question_title || "Untitled Question"}
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
              <span>{typeConfig?.icon}</span>
              <span>{typeConfig?.label || stat.question_type}</span>
              <span>•</span>
              <span>
                {stat.total_answered} of {totalResponses} answered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="mt-5">
        {/* Choice / Dropdown / Yes-No Bar List */}
        {stat.option_counts && stat.option_counts.length > 0 && (
          <div className="space-y-3">
            {stat.option_counts.map((opt) => {
              const percentage =
                stat.total_answered > 0
                  ? Math.round((opt.count / stat.total_answered) * 100)
                  : 0;

              return (
                <div key={opt.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 capitalize">
                      {opt.label}
                    </span>
                    <span className="text-gray-500">
                      {opt.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rating Breakdown */}
        {stat.question_type === "rating" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl font-bold text-amber-600">
                {stat.average_rating !== null ? stat.average_rating : "—"}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Average Rating
                </p>
                <p className="text-sm text-gray-500">
                  out of 5 stars
                </p>
              </div>
            </div>

            {stat.rating_distribution && (
              <div className="flex-1 space-y-1.5 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-6 pt-3 sm:pt-0">
                {Object.entries(stat.rating_distribution).map(([ratingKey, count]) => {
                  const percentage =
                    stat.total_answered > 0
                      ? Math.round((count / stat.total_answered) * 100)
                      : 0;

                  return (
                    <div key={ratingKey} className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-right font-medium text-gray-500">
                        {ratingKey}★
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-400">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Text / Email / Number simple summary */}
        {["short_text", "long_text", "email", "number"].includes(
          stat.question_type
        ) && (
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <span className="text-sm font-medium text-gray-700">
              Responses collected
            </span>
            <span className="text-sm font-bold text-gray-900">
              {stat.total_answered} text submissions
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
