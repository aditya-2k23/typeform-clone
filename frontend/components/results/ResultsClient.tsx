"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { FormDetail, FormStats, ResponseListItem } from "@/lib/types";
import ResultsTopBar from "./ResultsTopBar";
import SummaryTab from "./SummaryTab";
import ResponsesTab from "./ResponsesTab";

interface ResultsClientProps {
  formId: string;
}

export default function ResultsClient({ formId }: { formId: string }) {
  const [form, setForm] = useState<FormDetail | null>(null);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "responses">("summary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [formData, statsData, responsesData] = await Promise.all([
        apiFetch<FormDetail>(`/forms/${formId}`),
        apiFetch<FormStats>(`/forms/${formId}/stats`),
        apiFetch<ResponseListItem[]>(`/forms/${formId}/responses`),
      ]);

      setForm(formData);
      setStats(statsData);
      setResponses(responsesData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load results";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error && !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Failed to load form results
        </h2>
        <p className="mb-6 text-sm text-gray-500">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <ResultsTopBar
        formId={formId}
        formTitle={form?.title || "Loading..."}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "summary" ? (
          <SummaryTab stats={stats} loading={loading} />
        ) : (
          <ResponsesTab
            formId={formId}
            responses={responses}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}
