// lib/api/types/question-bank.ts
// Question banks: admin manages the banks and their questions; learners who have access start
// attempts and submit answers. Shapes are from the backend's real samples.

// Confirmed full enum.
export type AccessDuration = "lifetime" | "30_days" | "60_days" | "90_days" | "180_days" | "365_days";

export const ACCESS_DURATION_OPTIONS: { value: AccessDuration; label: string }[] = [
  { value: "lifetime", label: "Lifetime" },
  { value: "30_days", label: "30 days" },
  { value: "60_days", label: "60 days" },
  { value: "90_days", label: "90 days" },
  { value: "180_days", label: "180 days" },
  { value: "365_days", label: "1 year" },
];

export interface QuestionBank {
  id: number;
  name: string;
  description: string;
  access_duration: AccessDuration;
  is_active: boolean;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionBankRequest {
  name: string;
  description?: string;
  access_duration: AccessDuration;
}

export type PatchQuestionBankRequest = Partial<CreateQuestionBankRequest> & { is_active?: boolean };

export interface QuestionBankAccess {
  id: number;
  user: number;
  question_bank: number;
  granted_by: number | null;
  starts_at: string;
  expires_at: string | null;
  status: string;
  has_access: boolean;
  created_at: string;
}

export interface GrantQuestionBankAccessRequest {
  user_id: number;
}

export type AnswerLetter = "A" | "B" | "C" | "D";

export interface AdminQuestion {
  id: number;
  question_bank: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: AnswerLetter;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatchQuestionRequest {
  text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: AnswerLetter;
  is_active?: boolean;
}

export interface QuestionUploadResponse {
  created: number;
}

// --- learner attempts

export type AttemptStatus = "in_progress" | "submitted" | (string & {});

// A question as a learner sees it during an attempt — no correct answer.
export interface AttemptQuestion {
  id: number;
  text: string;
  options: Record<AnswerLetter, string>;
}

export interface AttemptAnswerResult {
  question: number;
  selected_option: AnswerLetter | null;
  correct_option: AnswerLetter;
  is_correct: boolean;
}

export interface QuestionBankAttempt {
  id: number;
  question_bank: number;
  status: AttemptStatus;
  total_questions: number;
  correct_answers: number;
  score_percent: string | null;
  started_at: string;
  submitted_at: string | null;
  questions?: AttemptQuestion[];
  answers?: AttemptAnswerResult[];
}

export interface StartAttemptRequest {
  limit: number;
}

export interface SubmitAttemptRequest {
  answers: { question_id: number; answer: AnswerLetter }[];
}

// GET /api/question-banks/mine/ — banks the signed-in learner can currently open.
export interface MyQuestionBankAccess {
  id: number;
  question_bank: QuestionBank;
  starts_at: string;
  expires_at: string | null;
  status: string;
  has_access: boolean;
}
