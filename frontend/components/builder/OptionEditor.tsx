"use client";

interface OptionEditorProps {
  options: { label: string; order: number }[];
  onChange: (options: { label: string; order: number }[]) => void;
}

export default function OptionEditor({ options, onChange }: OptionEditorProps) {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function updateLabel(index: number, label: string) {
    const updated = [...options];
    updated[index] = { ...updated[index], label };
    onChange(updated);
  }

  function removeOption(index: number) {
    const updated = options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({ ...opt, order: i }));
    onChange(updated);
  }

  function addOption() {
    onChange([
      ...options,
      { label: "", order: options.length },
    ]);
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Options
      </label>

      <div className="space-y-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Letter prefix */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-xs font-semibold text-gray-400">
              {LETTERS[i] ?? i + 1}
            </span>

            {/* Option text input */}
            <input
              type="text"
              value={opt.label}
              onChange={(e) => updateLabel(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            />

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removeOption(i)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove option ${i + 1}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add option */}
      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M7 3v8M3 7h8" />
        </svg>
        Add option
      </button>
    </div>
  );
}
