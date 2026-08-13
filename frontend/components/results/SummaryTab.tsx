"use client";

import type { FormStats } from "@/lib/types";
import QuestionStatCard from "./QuestionStatCard";

interface SummaryTabProps {
  stats: FormStats | null;
  loading: boolean;
}

export default function SummaryTab({ stats, loading }: SummaryTabProps) {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-48 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-48 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (!stats || stats.total_responses === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400">
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M7 12h10M7 8h10M7 16h6" />
          </svg>
        </div>
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          No responses yet
        </h3>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
          Share your published form link to start collecting and analyzing responses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metric Header Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#181a1d] p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Total Responses
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stats.total_responses}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#181a1d] p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Total Questions
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stats.questions.length}
          </p>
        </div>
      </div>

      {/* Question Stats Stack */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Question Breakdown
        </h2>
        <div className="space-y-4">
          {stats.questions.map((qStat, idx) => (
            <QuestionStatCard
              key={qStat.question_id || idx}
              stat={qStat}
              index={idx}
              totalResponses={stats.total_responses}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
