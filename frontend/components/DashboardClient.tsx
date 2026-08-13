"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { FormListItem, FormDetail, FormPublishOut } from "@/lib/types";

import Navbar from "@/components/Navbar";
import CreateButton from "@/components/CreateButton";
import FormCard from "@/components/FormCard";
import Toast, { type ToastData } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import ShareModal from "@/components/ShareModal";

export default function DashboardClient() {
  const router = useRouter();

  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [shareModalSlug, setShareModalSlug] = useState<string | null>(null);

  // Fetch forms
  const fetchForms = useCallback(async () => {
    try {
      const data = await apiFetch<FormListItem[]>("/forms");
      setForms(data);
    } catch (err) {
      showToast("Failed to load forms", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Helpers
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  // Create
  async function handleCreate() {
    setCreating(true);
    try {
      const form = await apiFetch<FormDetail>("/forms", {
        method: "POST",
        body: JSON.stringify({ title: "Untitled Form" }),
      });
      showToast("Form created");
      router.push(`/forms/${form.id}/builder`);
    } catch {
      showToast("Failed to create form", "error");
      setCreating(false);
    }
  }

  // Duplicate
  async function handleDuplicate(id: string) {
    try {
      await apiFetch<FormDetail>(`/forms/${id}/duplicate`, { method: "POST" });
      showToast("Form duplicated");
      fetchForms();
    } catch {
      showToast("Failed to duplicate form", "error");
    }
  }

  // Delete
  async function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setConfirmDelete(null);
    try {
      await apiFetch(`/forms/${id}`, { method: "DELETE" });
      showToast("Form deleted");
      fetchForms();
    } catch {
      showToast("Failed to delete form", "error");
    }
  }

  // Publish / Unpublish
  async function handleTogglePublish(id: string, currentStatus: string) {
    const action = currentStatus === "published" ? "unpublish" : "publish";
    try {
      const res = await apiFetch<FormPublishOut | FormDetail>(`/forms/${id}/${action}`, { method: "POST" });
      if (action === "publish") {
        showToast("Form published");
        if ("slug" in res && res.slug) {
          setShareModalSlug(res.slug);
        }
      } else {
        showToast("Form unpublished");
      }
      fetchForms();
    } catch {
      showToast(`Failed to ${action} form`, "error");
    }
  }

  // Render
  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              My Typeforms
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {forms.length} form{forms.length !== 1 && "s"}
            </p>
          </div>
          <CreateButton onClick={handleCreate} loading={creating} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#181a1d]"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && forms.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 py-24">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M9 9h6M9 13h4" />
              </svg>
            </div>
            <p className="mb-1 text-base font-medium text-gray-900 dark:text-gray-100">
              No forms yet
            </p>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Create your first typeform to get started
            </p>
            <CreateButton onClick={handleCreate} loading={creating} />
          </div>
        )}

        {/* Form grid */}
        {!loading && forms.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onDuplicate={handleDuplicate}
                onDelete={(id) => setConfirmDelete(id)}
                onTogglePublish={handleTogglePublish}
                onShare={(f) => setShareModalSlug(f.slug)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete form"
          message="This will permanently delete the form and all its responses. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Share / Public URL Modal */}
      {shareModalSlug && (
        <ShareModal
          slug={shareModalSlug}
          title="Share your typeform"
          onClose={() => setShareModalSlug(null)}
        />
      )}
    </>
  );
}
