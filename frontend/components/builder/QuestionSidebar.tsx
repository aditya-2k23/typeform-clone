"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import type { QuestionOut } from "@/lib/types";
import QuestionSidebarItem from "./QuestionSidebarItem";
import QuestionTypePicker from "./QuestionTypePicker";

interface QuestionSidebarProps {
  questions: QuestionOut[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (items: { question_id: string; order: number }[]) => void;
  onAddQuestion: (type: string) => void;
}

export default function QuestionSidebar({
  questions,
  selectedId,
  onSelect,
  onReorder,
  onAddQuestion,
}: QuestionSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex);

    onReorder(
      reordered.map((q, i) => ({ question_id: q.id, order: i + 1 }))
    );
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-gray-100 bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Questions
        </h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
          {questions.length}
        </span>
      </div>

      {/* Sortable list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-0.5">
              {questions.map((q, i) => (
                <QuestionSidebarItem
                  key={q.id}
                  question={q}
                  index={i}
                  isSelected={q.id === selectedId}
                  onClick={() => onSelect(q.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Add question button */}
      <div className="border-t border-gray-100 px-3 py-3">
        <QuestionTypePicker onSelect={onAddQuestion} />
      </div>
    </aside>
  );
}
