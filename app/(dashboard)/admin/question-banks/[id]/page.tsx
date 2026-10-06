"use client";

import { use } from "react";
import { QuestionBankDetailPage } from "@/components/dashboard/question-banks/question-bank-detail";

export default function AdminQuestionBankRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <QuestionBankDetailPage bankId={Number(id)} />;
}
