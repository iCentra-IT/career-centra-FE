"use client";

import { use } from "react";
import { StudentAttemptPage } from "@/components/dashboard/question-banks/student-question-bank";

export default function StudentAttemptRoute({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  return <StudentAttemptPage attemptId={Number(attemptId)} />;
}
