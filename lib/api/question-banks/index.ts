// lib/api/question-banks/index.ts
import { apiClient } from "../client";
import { ApiResponse, PaginatedResponse, unwrapList, unwrapObject } from "@/types/api";
import type {
  AdminQuestion,
  CreateQuestionBankRequest,
  GrantQuestionBankAccessRequest,
  PatchQuestionBankRequest,
  PatchQuestionRequest,
  QuestionBank,
  QuestionBankAccess,
  QuestionBankAttempt,
  QuestionUploadResponse,
  StartAttemptRequest,
  SubmitAttemptRequest,
} from "@/types/question-bank";

// ---------------------------------------------------------------- admin: banks

// The list is a bare envelope ({success, message, data: [...]}), not paginated.
export async function getQuestionBanks(): Promise<QuestionBank[]> {
  const { data } = await apiClient.get<ApiResponse<QuestionBank[]> | PaginatedResponse<QuestionBank>>(
    "/api/admin/question-banks/",
  );
  return unwrapList<QuestionBank>(data);
}

export async function getQuestionBank(id: number): Promise<QuestionBank> {
  const { data } = await apiClient.get<ApiResponse<QuestionBank>>(`/api/admin/question-banks/${id}/`);
  return unwrapObject<QuestionBank>(data);
}

export async function createQuestionBank(payload: CreateQuestionBankRequest): Promise<QuestionBank> {
  const { data } = await apiClient.post<ApiResponse<QuestionBank>>("/api/admin/question-banks/", payload);
  return unwrapObject<QuestionBank>(data);
}

export async function patchQuestionBank(id: number, payload: PatchQuestionBankRequest): Promise<QuestionBank> {
  const { data } = await apiClient.patch<ApiResponse<QuestionBank>>(`/api/admin/question-banks/${id}/`, payload);
  return unwrapObject<QuestionBank>(data);
}

export async function deleteQuestionBank(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/question-banks/${id}/`);
}

export async function grantQuestionBankAccess(
  id: number,
  payload: GrantQuestionBankAccessRequest,
): Promise<QuestionBankAccess> {
  const { data } = await apiClient.post<ApiResponse<QuestionBankAccess>>(
    `/api/admin/question-banks/${id}/grant-access/`,
    payload,
  );
  return unwrapObject<QuestionBankAccess>(data);
}

// Multipart with a single `file` field (a CSV). Returns how many questions were created.
export async function uploadQuestionBankCsv(id: number, file: File): Promise<QuestionUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<ApiResponse<QuestionUploadResponse>>(
    `/api/admin/question-banks/${id}/questions/upload/`,
    formData,
    { headers: { "Content-Type": undefined } },
  );
  return unwrapObject<QuestionUploadResponse>(data);
}

// ---------------------------------------------------------------- admin: questions

// The spec has no endpoint that lists a bank's questions, only get/update/delete by question id.
export async function getAdminQuestion(id: number): Promise<AdminQuestion> {
  const { data } = await apiClient.get<ApiResponse<AdminQuestion>>(`/api/admin/questions/${id}/`);
  return unwrapObject<AdminQuestion>(data);
}

export async function patchAdminQuestion(id: number, payload: PatchQuestionRequest): Promise<AdminQuestion> {
  const { data } = await apiClient.patch<ApiResponse<AdminQuestion>>(`/api/admin/questions/${id}/`, payload);
  return unwrapObject<AdminQuestion>(data);
}

export async function deleteAdminQuestion(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/questions/${id}/`);
}

// ---------------------------------------------------------------- learner: attempts

export async function getMyAttempts(questionBankId: number): Promise<QuestionBankAttempt[]> {
  const { data } = await apiClient.get<ApiResponse<QuestionBankAttempt[]> | QuestionBankAttempt[]>(
    `/api/question-banks/${questionBankId}/attempts/`,
  );
  return unwrapList<QuestionBankAttempt>(data);
}

// Returns the attempt with its questions (no answers) — the learner answers those.
export async function startAttempt(questionBankId: number, payload: StartAttemptRequest): Promise<QuestionBankAttempt> {
  const { data } = await apiClient.post<ApiResponse<QuestionBankAttempt>>(
    `/api/question-banks/${questionBankId}/attempts/`,
    payload,
  );
  return unwrapObject<QuestionBankAttempt>(data);
}

export async function getAttempt(attemptId: number): Promise<QuestionBankAttempt> {
  const { data } = await apiClient.get<ApiResponse<QuestionBankAttempt>>(`/api/attempts/${attemptId}/`);
  return unwrapObject<QuestionBankAttempt>(data);
}

// Scores the attempt. The response includes per-question correctness.
export async function submitAttempt(attemptId: number, payload: SubmitAttemptRequest): Promise<QuestionBankAttempt> {
  const { data } = await apiClient.post<ApiResponse<QuestionBankAttempt>>(
    `/api/attempts/${attemptId}/submit/`,
    payload,
  );
  return unwrapObject<QuestionBankAttempt>(data);
}
