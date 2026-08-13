"use client";

import { useState, useEffect } from "react";
import type { QuestionOut } from "@/lib/types";
import { QUESTION_TYPE_MAP } from "@/lib/question-types";
import { useDebouncedCallback } from "@/lib/hooks/useDebounce";
import OptionEditor from "./OptionEditor";

interface QuestionEditorProps {
  question: QuestionOut;
  onChange: (updates: Partial<QuestionOut>) => void;
  onDelete: () => void;
}

export default function QuestionEditor({
  question,
  onChange,
  onDelete,
}: QuestionEditorProps) {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description || "");

  // Reset local state when a different question is selected
  useEffect(() => {
    setTitle(question.title);
    setDescription(question.description || "");
  }, [question.id, question.title, question.description]);

  const debouncedOnChange = useDebouncedCallback(onChange, 500);

  function handleTitleChange(val: string) {
    setTitle(val);
    debouncedOnChange({ title: val });
  }

  function handleDescriptionChange(val: string) {
    setDescription(val);
    debouncedOnChange({ description: val });
  }

  function handleRequiredToggle() {
    onChange({ required: !question.required });
  }

  function handleSettingsChange(newSettings: Record<string, unknown>) {
    onChange({ settings: { ...question.settings, ...newSettings } });
  }

  const typeConfig = QUESTION_TYPE_MAP[question.type];
  const hasOptions =
    question.type === "multiple_choice" || question.type === "dropdown";

  return (
    <div className="mx-auto max-w-3xl flex-1 px-8 py-10">
      {/* Top meta row */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span className="text-gray-400">{typeConfig?.icon}</span>
          {typeConfig?.label || question.type}
        </div>
        <div className="flex items-center gap-4">
          {/* Required toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Required</span>
            <div
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                question.required ? "bg-gray-900" : "bg-gray-200"
              }`}
              onClick={handleRequiredToggle}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  question.required ? "translate-x-4.5" : "translate-x-1"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Your question here..."
          className="w-full bg-transparent text-3xl font-medium tracking-tight text-gray-900 outline-none placeholder:text-gray-300"
        />
      </div>

      {/* Description */}
      <div className="mb-10">
        <input
          type="text"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Description (optional)"
          className="w-full bg-transparent text-lg text-gray-500 outline-none placeholder:text-gray-300"
        />
      </div>

      {/* Settings / Options */}
      <div className="mb-12">
        {hasOptions && (
          <OptionEditor
            options={question.options || []}
            onChange={(opts) => onChange({ options: opts })}
          />
        )}

        {question.type === "rating" && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Max Rating
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={(question.settings?.max_rating as number) || 5}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) handleSettingsChange({ max_rating: val });
              }}
              className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            />
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="border-t border-red-100 pt-6">
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 px-3 py-2 -ml-3"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M3 4h10M6 4V2.5C6 2.22386 6.22386 2 6.5 2h3C9.77614 2 10 2.22386 10 2.5V4M6.5 7v5M9.5 7v5M4 4v9.5C4 13.7761 4.22386 14 4.5 14h7c.2761 0 .5-.2239.5-.5V4" />
          </svg>
          Delete question
        </button>
      </div>
    </div>
  );
}
