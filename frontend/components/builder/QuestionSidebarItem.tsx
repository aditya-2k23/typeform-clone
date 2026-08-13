"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { QuestionOut } from "@/lib/types";
import { QUESTION_TYPE_MAP } from "@/lib/question-types";

interface QuestionSidebarItemProps {
  question: QuestionOut;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function QuestionSidebarItem({
  question,
  index,
  isSelected,
  onClick,
}: QuestionSidebarItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = QUESTION_TYPE_MAP[question.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all cursor-pointer ${
        isDragging
          ? "z-50 bg-white shadow-lg ring-1 ring-gray-200"
          : isSelected
            ? "bg-gray-900 text-white"
            : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className={`shrink-0 cursor-grab touch-none rounded p-0.5 transition-colors active:cursor-grabbing ${
          isSelected
            ? "text-gray-400 hover:text-gray-300"
            : "text-gray-300 hover:text-gray-500"
        }`}
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="4" cy="2.5" r="1" />
          <circle cx="8" cy="2.5" r="1" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="8" cy="6" r="1" />
          <circle cx="4" cy="9.5" r="1" />
          <circle cx="8" cy="9.5" r="1" />
        </svg>
      </button>

      {/* Question number */}
      <span
        className={`shrink-0 text-xs font-semibold tabular-nums ${
          isSelected ? "text-gray-400" : "text-gray-400"
        }`}
      >
        {index + 1}
      </span>

      {/* Type icon */}
      <span
        className={`shrink-0 ${
          isSelected ? "text-gray-300" : "text-gray-400"
        }`}
      >
        {typeConfig?.icon}
      </span>

      {/* Title (truncated) */}
      <span className="min-w-0 flex-1 truncate font-medium">
        {question.title || "Untitled"}
      </span>
    </div>
  );
}
