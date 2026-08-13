"use client";

import { useState, useEffect, useRef } from "react";
import type { QuestionOut } from "@/lib/types";
import { RATING_ICON_MAP } from "@/lib/rating-icons";

interface QuestionRendererProps {
  question: QuestionOut;
  questionNumber: number;
  interactive?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  error?: string | null;
  isLast?: boolean;
  submitting?: boolean;
}

export default function QuestionRenderer({
  question,
  questionNumber,
  interactive = false,
  value = "",
  onChange,
  onEnter,
  error,
  isLast = false,
  submitting = false,
}: QuestionRendererProps) {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Auto focus input/select when switching questions in interactive mode
  useEffect(() => {
    if (!interactive) return;

    if (question.type === "dropdown" && selectRef.current) {
      selectRef.current.focus();
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.id, question.type, interactive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // For text inputs: Enter advances
    // For textarea: Enter (without Shift) or Ctrl+Enter advances, Shift+Enter adds newline
    if (question.type === "long_text") {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onEnter?.();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onEnter?.();
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
  };

  const getHintText = () => {
    if (submitting) return null;
    if (isLast) return "press Enter ↵ to submit";

    switch (question.type) {
      case "multiple_choice":
        return "press A, B, C... or Enter ↵";
      case "yes_no":
        return "press Y or N";
      case "rating": {
        const max = (question.settings?.max_rating as number) || 5;
        return `press 1 to ${max} or Enter ↵`;
      }
      case "long_text":
        return "press Shift ⇧ + Enter ↵ for newline, Enter ↵ to advance";
      default:
        return "press Enter ↵";
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case "short_text":
      case "email":
      case "number":
        return (
          <div className="w-full">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={
                question.type === "email"
                  ? "email"
                  : question.type === "number"
                    ? "number"
                    : "text"
              }
              value={interactive ? value : ""}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              disabled={!interactive}
              aria-label={question.title || "Your answer"}
              className={`w-full border-b-2 bg-transparent py-2.5 text-2xl text-gray-900 dark:text-white outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                error
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 dark:border-gray-700 focus:border-gray-900 dark:focus:border-white"
              }`}
            />
          </div>
        );

      case "long_text":
        return (
          <div className="w-full">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={interactive ? value : ""}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              disabled={!interactive}
              aria-label={question.title || "Your answer"}
              rows={3}
              className={`w-full resize-none border-b-2 bg-transparent py-2.5 text-xl text-gray-900 dark:text-white outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 ${
                error
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 dark:border-gray-700 focus:border-gray-900 dark:focus:border-white"
              }`}
            />
            {interactive && (
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                Shift ⇧ + Enter ↵ for new line • Enter ↵ to advance
              </p>
            )}
          </div>
        );

      case "multiple_choice":
        return (
          <div role="radiogroup" aria-label={question.title} className="flex flex-col gap-2.5 max-w-lg">
            {question.options?.map((opt, i) => {
              const isSelected = value === opt.label;
              const letter = LETTERS[i] ?? i + 1;
              return (
                <button
                  key={opt.id || i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!interactive}
                  onClick={() => {
                    onChange?.(opt.label);
                  }}
                  className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden ${
                    !interactive
                      ? "cursor-not-allowed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 opacity-60"
                      : isSelected
                        ? "border-gray-900 dark:border-white bg-gray-900/5 dark:bg-white/10 ring-1 ring-gray-900 dark:ring-white"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181a1d] hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50/80 dark:hover:bg-gray-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs font-semibold transition-colors ${
                        isSelected
                          ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      }`}
                    >
                      {letter}
                    </span>
                    <span
                      className={`text-base font-medium transition-colors ${
                        isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && (
                    <svg
                      className="h-5 w-5 text-gray-900 dark:text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
            {(!question.options || question.options.length === 0) && (
              <div className="text-sm text-gray-400 dark:text-gray-500 italic">No options added yet</div>
            )}
          </div>
        );

      case "dropdown":
        return (
          <div className="max-w-md">
            <select
              ref={selectRef}
              value={interactive ? value : ""}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!interactive}
              aria-label={question.title || "Select an option"}
              className={`w-full rounded-xl border bg-white dark:bg-[#181a1d] px-4 py-3 text-base text-gray-900 dark:text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden ${
                !interactive
                  ? "cursor-not-allowed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 opacity-60"
                  : "border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white"
              }`}
            >
              <option value="" disabled>
                Select an option…
              </option>
              {question.options?.map((opt, i) => (
                <option key={opt.id || i} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "yes_no":
        return (
          <div role="radiogroup" aria-label={question.title} className="flex gap-4 max-w-sm">
            {[
              { label: "Yes", key: "Y" },
              { label: "No", key: "N" },
            ].map((opt) => {
              const isSelected = value === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!interactive}
                  onClick={() => onChange?.(opt.label)}
                  className={`group flex flex-1 items-center justify-between rounded-xl border px-5 py-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden ${
                    !interactive
                      ? "cursor-not-allowed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 opacity-60"
                      : isSelected
                        ? "border-gray-900 dark:border-white bg-gray-900/5 dark:bg-white/10 ring-1 ring-gray-900 dark:ring-white"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181a1d] hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50/80 dark:hover:bg-gray-800/80"
                  }`}
                >
                  <span
                    className={`text-lg font-medium ${
                      isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded border text-xs font-semibold ${
                      isSelected
                        ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                    }`}
                  >
                    {opt.key}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case "rating": {
        const max = (question.settings?.max_rating as number) || 5;
        const iconId = (question.settings?.icon as string) || "star";
        const iconConfig = RATING_ICON_MAP[iconId] || RATING_ICON_MAP["star"];
        const selectedRating = parseInt(value, 10) || 0;

        return (
          <div role="radiogroup" aria-label={question.title} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              {Array.from({ length: max }).map((_, i) => {
                const ratingNum = i + 1;
                const isLit =
                  hoverRating !== null
                    ? ratingNum <= hoverRating
                    : ratingNum <= selectedRating;

                return (
                  <button
                    key={ratingNum}
                    type="button"
                    role="radio"
                    aria-checked={ratingNum === selectedRating}
                    aria-label={`Rate ${ratingNum} of ${max}`}
                    disabled={!interactive}
                    onMouseEnter={() => interactive && setHoverRating(ratingNum)}
                    onMouseLeave={() => interactive && setHoverRating(null)}
                    onClick={() => {
                      if (interactive) {
                        onChange?.(String(ratingNum));
                      }
                    }}
                    className={`group flex flex-col items-center gap-1.5 p-1 transition-all rounded-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                      !interactive
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:scale-105"
                    }`}
                  >
                    <div
                      className={`transition-colors ${
                        isLit
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300 dark:text-gray-700 hover:text-gray-400 dark:hover:text-gray-600"
                      }`}
                    >
                      {iconConfig.render({
                        className: `w-12 h-12 ${isLit ? "fill-current" : "fill-none"}`,
                      })}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isLit ? "text-gray-900 dark:text-white font-semibold" : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {ratingNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return <div className="text-gray-400 dark:text-gray-500">Unsupported question type</div>;
    }
  };

  const hint = getHintText();

  return (
    <div className="flex min-h-[60vh] w-full flex-col justify-center px-6 sm:px-16 lg:px-28 animate-question-in">
      <div className="flex gap-4">
        {/* Number with arrow */}
        <div className="flex items-start gap-1 pt-1.5 text-gray-900 dark:text-white">
          <span className="text-xl font-bold">{questionNumber}</span>
          <svg
            className="mt-0.5"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 8h8M8 4l4 4-4 4" />
          </svg>
        </div>

        <div className="flex-1 max-w-2xl">
          {/* Title */}
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
            {question.title || "Untitled"}
            {question.required && (
              <span className="ml-1.5 text-red-500" aria-label="Required">*</span>
            )}
          </h1>

          {/* Description */}
          {question.description && (
            <p className="mb-6 text-base text-gray-500 dark:text-gray-400 sm:text-lg">
              {question.description}
            </p>
          )}

          {!question.description && <div className="mb-6" />}

          {/* Input area */}
          <div className="w-full">{renderInput()}</div>

          {/* Inline Error */}
          {error && (
            <div role="alert" className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 animate-in">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3.5M8 11v.5" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Action button & hint */}
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              disabled={!interactive || submitting}
              onClick={() => onEnter?.()}
              aria-label={isLast ? "Submit form" : "Confirm and next question (Enter)"}
              className={`flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-6 py-2.5 text-base font-semibold text-white dark:text-gray-900 shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:outline-hidden ${
                !interactive || submitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] cursor-pointer"
              }`}
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-gray-900 border-t-transparent" />
                  Submitting…
                </>
              ) : isLast ? (
                <>
                  Submit
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
                    <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                  </svg>
                </>
              ) : (
                <>
                  OK
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
                    <polyline points="5.5 3.5 10.5 8.5 5.5 13.5" />
                  </svg>
                </>
              )}
            </button>

            {interactive && hint && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {hint}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
