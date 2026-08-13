"use client";

import type { QuestionOut } from "@/lib/types";
import { RATING_ICON_MAP } from "@/lib/rating-icons";

interface QuestionRendererProps {
  question: QuestionOut;
  questionNumber: number;
}

export default function QuestionRenderer({
  question,
  questionNumber,
}: QuestionRendererProps) {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Dummy inputs that don't do anything for the builder preview
  const renderInput = () => {
    switch (question.type) {
      case "short_text":
      case "email":
      case "number":
        return (
          <input
            type="text"
            placeholder="Type your answer here..."
            disabled
            className="w-full border-b-2 border-gray-300 bg-transparent py-2 text-2xl text-gray-900 outline-none placeholder:text-gray-300"
          />
        );

      case "long_text":
        return (
          <textarea
            placeholder="Type your answer here..."
            disabled
            rows={3}
            className="w-full resize-none border-b-2 border-gray-300 bg-transparent py-2 text-xl text-gray-900 outline-none placeholder:text-gray-300"
          />
        );

      case "multiple_choice":
      case "dropdown":
        return (
          <div className="flex flex-col gap-3">
            {question.options?.map((opt, i) => (
              <div
                key={opt.id}
                className="flex cursor-not-allowed items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 opacity-60"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-xs font-bold text-gray-500">
                  {LETTERS[i] ?? i + 1}
                </div>
                <span className="text-lg text-gray-700">{opt.label}</span>
              </div>
            ))}
            {(!question.options || question.options.length === 0) && (
              <div className="text-sm text-gray-400 italic">No options added yet</div>
            )}
          </div>
        );

      case "yes_no":
        return (
          <div className="flex gap-4">
            {["Yes", "No"].map((opt, i) => (
              <div
                key={opt}
                className="flex cursor-not-allowed items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 px-6 py-4 opacity-60"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-xs font-bold text-gray-500">
                  {LETTERS[i]}
                </div>
                <span className="text-xl text-gray-700">{opt}</span>
              </div>
            ))}
          </div>
        );

      case "rating": {
        const max = (question.settings?.max_rating as number) || 5;
        const iconId = (question.settings?.icon as string) || "star";
        const iconConfig = RATING_ICON_MAP[iconId] || RATING_ICON_MAP["star"];

        return (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: max }).map((_, i) => (
              <div
                key={i}
                className="flex cursor-not-allowed items-center justify-center text-gray-300 opacity-60 transition-colors"
              >
                {iconConfig.render({ className: "w-12 h-12" })}
              </div>
            ))}
          </div>
        );
      }

      default:
        return <div className="text-gray-400">Unsupported question type</div>;
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-center px-10 sm:px-20 lg:px-32">
      <div className="flex gap-4">
        {/* Number with arrow */}
        <div className="flex items-start gap-1 pt-1 text-gray-900">
          <span className="text-xl font-bold">{questionNumber}</span>
          <svg
            className="mt-1"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 8h8M8 4l4 4-4 4" />
          </svg>
        </div>

        <div className="flex-1">
          {/* Title */}
          <h1 className="mb-2 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
            {question.title || "Untitled"}
            {question.required && (
              <span className="ml-2 text-red-500">*</span>
            )}
          </h1>

          {/* Description */}
          {question.description && (
            <p className="mb-8 text-lg text-gray-500">
              {question.description}
            </p>
          )}

          {!question.description && <div className="mb-8" />}

          {/* Input area */}
          <div className="max-w-2xl">{renderInput()}</div>
          
          {/* Fake OK button */}
          <div className="mt-10">
            <button
              disabled
              className="flex items-center gap-2 rounded-md bg-gray-900 px-6 py-2.5 text-lg font-bold text-white opacity-50"
            >
              OK
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 8h6M8 5l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
