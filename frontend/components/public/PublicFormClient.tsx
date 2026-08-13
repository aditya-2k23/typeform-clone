"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { PublicFormOut, SubmitResponseRequest, SubmitResponseOut } from "@/lib/types";
import QuestionRenderer from "@/components/builder/QuestionRenderer";
import ProgressBar from "./ProgressBar";
import ThankYouScreen from "./ThankYouScreen";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface PublicFormClientProps {
  slug: string;
}

export default function PublicFormClient({ slug }: PublicFormClientProps) {
  const [form, setForm] = useState<PublicFormOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Fetch form by slug ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadForm() {
      try {
        const data = await apiFetch<PublicFormOut>(`/public/forms/${slug}`);
        setForm(data);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [slug]);

  // ── Validation ──────────────────────────────────────────────────────────
  const validateQuestion = useCallback(
    (questionId: string, value: string | undefined): string | null => {
      if (!form) return null;
      const question = form.questions.find((q) => q.id === questionId);
      if (!question) return null;

      const trimmed = (value || "").trim();

      if (question.required && !trimmed) {
        return "Please fill this in";
      }

      if (trimmed && question.type === "email" && !EMAIL_REGEX.test(trimmed)) {
        return "Please enter a valid email address";
      }

      if (trimmed && question.type === "number" && isNaN(Number(trimmed))) {
        return "Please enter a valid number";
      }

      return null;
    },
    [form]
  );

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!form || submitting) return;

    // Validate all questions before sending
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      const val = answers[q.id] || "";
      const validationErr = validateQuestion(q.id, val);
      if (validationErr) {
        setCurrentIndex(i);
        setError(validationErr);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const payload: SubmitResponseRequest = {
      answers: form.questions.map((q) => ({
        question_id: q.id,
        value: answers[q.id] || "",
      })),
    };

    try {
      await apiFetch<SubmitResponseOut>(`/public/forms/${slug}/responses`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to submit response";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }, [form, submitting, answers, slug, validateQuestion]);

  // ── Advance / Navigate ──────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (!form || form.questions.length === 0) return;

    const currentQ = form.questions[currentIndex];
    const currentVal = answers[currentQ.id] || "";
    const err = validateQuestion(currentQ.id, currentVal);

    if (err) {
      setError(err);
      return;
    }

    setError(null);

    if (currentIndex < form.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [form, currentIndex, answers, validateQuestion, handleSubmit]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setError(null);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      setError(null);
    },
    []
  );

  // ── Keyboard shortcuts for navigation & choices ─────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!form || submitted || loading) return;

      const currentQ = form.questions[currentIndex];
      if (!currentQ) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputActive = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

      // Multiple choice keyboard selection (A, B, C...)
      if (
        !isInputActive &&
        currentQ.type === "multiple_choice" &&
        currentQ.options &&
        e.key.length === 1 &&
        /^[a-zA-Z]$/.test(e.key)
      ) {
        const index = e.key.toUpperCase().charCodeAt(0) - 65;
        if (index >= 0 && index < currentQ.options.length) {
          handleAnswerChange(currentQ.id, currentQ.options[index].label);
          return;
        }
      }

      // Rating number selection (1, 2, 3...)
      if (!isInputActive && currentQ.type === "rating") {
        const digit = parseInt(e.key, 10);
        const max = (currentQ.settings?.max_rating as number) || 5;
        if (!isNaN(digit) && digit >= 1 && digit <= max) {
          handleAnswerChange(currentQ.id, String(digit));
          return;
        }
      }

      // Yes / No keyboard selection (Y, N)
      if (!isInputActive && currentQ.type === "yes_no") {
        if (e.key.toLowerCase() === "y") {
          handleAnswerChange(currentQ.id, "Yes");
          return;
        }
        if (e.key.toLowerCase() === "n") {
          handleAnswerChange(currentQ.id, "No");
          return;
        }
      }

      // Enter key to advance when not focused on an input/textarea
      if (!isInputActive && e.key === "Enter") {
        e.preventDefault();
        handleNext();
        return;
      }

      // Arrow keys navigation
      if (!isInputActive) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          handlePrev();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          handleNext();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [form, currentIndex, submitted, loading, handleAnswerChange, handleNext, handlePrev]);

  // ── States ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          This form isn&apos;t available
        </h1>
        <p className="mb-6 max-w-sm text-sm text-gray-500">
          The link may be broken or the form might have been unpublished by its owner.
        </p>
        <Link
          href="/"
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  if (submitted) {
    return <ThankYouScreen formTitle={form.title} />;
  }

  if (form.questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900 px-6 text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          {form.title}
        </h1>
        <p className="text-sm text-gray-500">This form does not have any questions yet.</p>
      </div>
    );
  }

  const currentQuestion = form.questions[currentIndex];
  const isLast = currentIndex === form.questions.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Fixed top progress bar */}
      <ProgressBar current={currentIndex + 1} total={form.questions.length} />

      {/* Main question card */}
      <main className="flex flex-1 items-center justify-center">
        <QuestionRenderer
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          interactive={true}
          value={answers[currentQuestion.id] || ""}
          onChange={(val) => handleAnswerChange(currentQuestion.id, val)}
          onEnter={handleNext}
          error={error}
          isLast={isLast}
          submitting={submitting}
        />
      </main>

      {/* Fixed bottom controls */}
      <footer className="sticky bottom-0 z-40 flex items-center justify-between border-t border-gray-100 bg-white/80 px-6 py-3 backdrop-blur-sm sm:px-12">
        <div className="text-xs text-gray-400">
          <span className="font-medium text-gray-600">
            {currentIndex + 1}
          </span>{" "}
          of {form.questions.length}
        </div>

        {/* Up / Down navigation arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous question"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
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
              <path d="M4 10l4-4 4 4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            aria-label="Next question"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
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
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
