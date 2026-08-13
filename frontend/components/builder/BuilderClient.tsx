"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { FormDetail, QuestionOut } from "@/lib/types";

import BuilderTopBar from "./BuilderTopBar";
import QuestionSidebar from "./QuestionSidebar";
import QuestionEditor from "./QuestionEditor";
import PreviewPanel from "./PreviewPanel";
import Toast, { type ToastData } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function BuilderClient({ formId }: { formId: string }) {
  const router = useRouter();
  
  const [form, setForm] = useState<FormDetail | null>(null);
  const [questions, setQuestions] = useState<QuestionOut[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [confirmDeleteQ, setConfirmDeleteQ] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const fetchForm = useCallback(async () => {
    try {
      const data = await apiFetch<FormDetail>(`/forms/${formId}`);
      setForm(data);
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0 && !selectedId) {
        setSelectedId(data.questions[0].id);
      }
    } catch (err) {
      setToast({ message: "Failed to load form", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [formId, selectedId]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  // ── Form Actions ────────────────────────────────────────────────────────
  
  async function handleTitleChange(title: string) {
    if (!form) return;
    setSaveStatus("saving");
    try {
      const updated = await apiFetch<FormDetail>(`/forms/${form.id}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      });
      setForm(updated);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
      setToast({ message: "Failed to save title", type: "error" });
    }
  }

  async function handlePublish() {
    if (!form) return;
    try {
      const res = await apiFetch<{ public_url: string }>(`/forms/${form.id}/publish`, {
        method: "POST",
      });
      setForm({ ...form, status: "published" });
      setPublishedUrl(res.public_url);
      setToast({ message: "Form published successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to publish form", type: "error" });
    }
  }

  async function handleUnpublish() {
    if (!form) return;
    try {
      await apiFetch(`/forms/${form.id}/unpublish`, { method: "POST" });
      setForm({ ...form, status: "draft" });
      setToast({ message: "Form unpublished", type: "success" });
    } catch {
      setToast({ message: "Failed to unpublish form", type: "error" });
    }
  }

  // ── Question Actions ────────────────────────────────────────────────────

  async function handleAddQuestion(type: string) {
    if (!form) return;
    setSaveStatus("saving");
    try {
      const newQ = await apiFetch<QuestionOut>(`/forms/${form.id}/questions`, {
        method: "POST",
        body: JSON.stringify({
          type,
          title: "New Question",
        }),
      });
      setQuestions((prev) => [...prev, newQ]);
      setSelectedId(newQ.id);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
      setToast({ message: "Failed to add question", type: "error" });
    }
  }

  async function handleUpdateQuestion(updates: Partial<QuestionOut>) {
    if (!selectedId) return;
    
    // Optimistic UI update
    setQuestions((prev) =>
      prev.map((q) => (q.id === selectedId ? { ...q, ...updates } : q))
    );
    setSaveStatus("saving");

    try {
      const updatedQ = await apiFetch<QuestionOut>(`/questions/${selectedId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      // Sync back with server response
      setQuestions((prev) =>
        prev.map((q) => (q.id === selectedId ? updatedQ : q))
      );
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
      setToast({ message: "Failed to save question", type: "error" });
    }
  }

  async function handleDeleteQuestion() {
    if (!confirmDeleteQ) return;
    const qId = confirmDeleteQ;
    setConfirmDeleteQ(null);
    setSaveStatus("saving");
    
    try {
      await apiFetch(`/questions/${qId}`, { method: "DELETE" });
      setQuestions((prev) => {
        const filtered = prev.filter((q) => q.id !== qId);
        // Select the first available question if we deleted the selected one
        if (selectedId === qId) {
          setSelectedId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
      setSaveStatus("saved");
      setToast({ message: "Question deleted", type: "success" });
    } catch {
      setSaveStatus("error");
      setToast({ message: "Failed to delete question", type: "error" });
    }
  }

  async function handleReorderQuestions(items: { question_id: string; order: number }[]) {
    if (!form) return;
    
    // Optimistic UI update based on new order
    setQuestions((prev) => {
      const newQuestions = [...prev];
      items.forEach((item) => {
        const q = newQuestions.find((q) => q.id === item.question_id);
        if (q) q.order = item.order;
      });
      return newQuestions.sort((a, b) => a.order - b.order);
    });

    try {
      await apiFetch(`/forms/${form.id}/questions/reorder`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      });
    } catch {
      setToast({ message: "Failed to reorder questions", type: "error" });
      fetchForm(); // revert on failure
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading || !form) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  const selectedQuestion = questions.find((q) => q.id === selectedId);
  const selectedIndex = questions.findIndex((q) => q.id === selectedId);

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-[#111315]">
      <BuilderTopBar
        form={form}
        saveStatus={saveStatus}
        onTitleChange={handleTitleChange}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onPreview={() => setPreviewOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar
          questions={questions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onReorder={handleReorderQuestions}
          onAddQuestion={handleAddQuestion}
        />

        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#111315]">
          {selectedQuestion ? (
            <QuestionEditor
              question={selectedQuestion}
              onChange={handleUpdateQuestion}
              onDelete={() => setConfirmDeleteQ(selectedQuestion.id)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p>Add a question to start building your form</p>
            </div>
          )}
        </main>
      </div>

      {previewOpen && (
        <PreviewPanel
          question={selectedQuestion || null}
          questionNumber={selectedIndex !== -1 ? selectedIndex + 1 : 0}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmDeleteQ && (
        <ConfirmDialog
          title="Delete Question"
          message="Are you sure you want to delete this question? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDeleteQuestion}
          onCancel={() => setConfirmDeleteQ(null)}
        />
      )}

      {/* Published Success Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setPublishedUrl(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#181a1d] border border-gray-100 dark:border-gray-800 p-7 shadow-2xl animate-in">
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
            <h2 className="mb-1.5 text-lg font-semibold text-gray-900 dark:text-white">
              Your typeform is live!
            </h2>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Anyone with this link can now view and submit responses.
            </p>

            <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111315] p-2 text-sm">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}${publishedUrl}`
                    : publishedUrl
                }
                className="flex-1 bg-transparent px-2 text-xs font-mono text-gray-700 dark:text-gray-300 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${publishedUrl}`
                  );
                  setToast({ message: "Link copied to clipboard", type: "success" });
                }}
                className="rounded-lg bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-200 shadow-xs border border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Copy
              </button>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPublishedUrl(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Done
              </button>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900 transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
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
      )}
    </div>
  );
}
