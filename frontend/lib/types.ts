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

export interface PublicFormOut {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  questions: QuestionOut[];
}

export interface AnswerIn {
  question_id: string;
  value: string;
}

export interface SubmitResponseRequest {
  answers: AnswerIn[];
}

export interface SubmitResponseOut {
  response_id: string;
}

export interface AnswerPreview {
  question_title: string;
  value: string;
}

export interface ResponseListItem {
  id: string;
  submitted_at: string;
  preview: AnswerPreview[];
}

export interface AnswerDetail {
  question_id: string;
  question_title: string;
  question_type: string;
  value: string;
}

export interface ResponseDetail {
  id: string;
  form_id: string;
  submitted_at: string;
  answers: AnswerDetail[];
}

export interface OptionCount {
  label: string;
  count: number;
}

export interface QuestionStat {
  question_id: string;
  question_title: string;
  question_type: string;
  total_answered: number;
  option_counts: OptionCount[] | null;
  average_rating: number | null;
  rating_distribution: Record<string, number> | null;
}

export interface FormStats {
  form_id: string;
  total_responses: number;
  questions: QuestionStat[];
}


