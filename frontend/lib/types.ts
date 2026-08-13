/**
 * Shared TypeScript types mirroring the backend Pydantic schemas.
 */

export interface FormListItem {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  slug: string;
  question_count: number;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  slug: string;
  created_at: string;
  updated_at: string;
  questions: QuestionOut[];
}

export interface QuestionOut {
  id: string;
  form_id: string;
  type: string;
  title: string;
  description: string | null;
  required: boolean;
  order: number;
  settings: Record<string, unknown> | null;
  options: QuestionOptionOut[];
}

export interface QuestionOptionOut {
  id: string;
  label: string;
  order: number;
}

export interface FormPublishOut {
  id: string;
  status: string;
  slug: string;
  public_url: string;
}
