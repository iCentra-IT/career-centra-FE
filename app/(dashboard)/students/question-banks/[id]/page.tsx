"use client";

import { use } from "react";
import { StudentQuestionBankPage } from "@/components/dashboard/question-banks/student-question-bank";

export default function StudentQuestionBankRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StudentQuestionBankPage bankId={Number(id)} />;
}
