import type { ReactNode } from "react";

export interface QuestionTypeConfig {
  type: string;
  label: string;
  icon: ReactNode;
}

/* ── SVG icon helper (18×18, stroke-based) ───────────────────────────── */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/* ── Question type definitions ───────────────────────────────────────── */

export const QUESTION_TYPES: QuestionTypeConfig[] = [
  {
    type: "short_text",
    label: "Short Text",
    icon: (
      <Icon>
        <path d="M3 5h12M3 9h7" />
      </Icon>
    ),
  },
  {
    type: "long_text",
    label: "Long Text",
    icon: (
      <Icon>
        <path d="M3 4h12M3 7.5h12M3 11h9M3 14.5h6" />
      </Icon>
    ),
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    icon: (
      <Icon>
        <circle cx="5" cy="5" r="2" />
        <path d="M9 5h6" />
        <circle cx="5" cy="13" r="2" />
        <path d="M9 13h6" />
      </Icon>
    ),
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: (
      <Icon>
        <rect x="3" y="4" width="12" height="10" rx="2" />
        <path d="M7 9l2 2 2-2" />
      </Icon>
    ),
  },
  {
    type: "email",
    label: "Email",
    icon: (
      <Icon>
        <rect x="2" y="4" width="14" height="10" rx="2" />
        <path d="M2 6l7 4.5L16 6" />
      </Icon>
    ),
  },
  {
    type: "number",
    label: "Number",
    icon: (
      <Icon>
        <text
          x="9"
          y="12"
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          stroke="none"
          fontWeight="600"
        >
          #
        </text>
      </Icon>
    ),
  },
  {
    type: "yes_no",
    label: "Yes / No",
    icon: (
      <Icon>
        <path d="M4 9.5l3 3 7-7" />
      </Icon>
    ),
  },
  {
    type: "rating",
    label: "Rating",
    icon: (
      <Icon>
        <path d="M9 2l2.2 4.5 5 .7-3.6 3.5.9 5L9 13.5 4.5 15.7l.9-5L1.8 7.2l5-.7z" />
      </Icon>
    ),
  },
];

export const QUESTION_TYPE_MAP: Record<string, QuestionTypeConfig> =
  Object.fromEntries(QUESTION_TYPES.map((qt) => [qt.type, qt]));
