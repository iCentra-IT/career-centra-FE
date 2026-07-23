// lib/api/types/cohort.ts
import { EnrollmentProgramSummary } from './enrollment'; // reuse if identical shape, see note below

// Program summary as embedded in cohort — richer than the enrollment's version (adds pricing/level)
export interface CohortProgramSummary {
  id: number;
  title: string;
  slug: string;
  program_type: string; // reuse ProgramType from program.ts if you want strict typing
  level: string; // reuse ProgramLevel
  base_price_usd: string;
  base_price_ngn: string;
}

export interface CohortSession {
  id: number;
  title: string;
  date: string; // date only
  start_time: string; // NOTE: sample shows "10:56:15.386Z" — looks like a full ISO datetime
  end_time: string;   // was serialized into a time field. Flag below.
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCohortSessionRequest {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  order: number;
}

export type UpdateCohortSessionRequest = CreateCohortSessionRequest; // PUT
export type PatchCohortSessionRequest = Partial<CreateCohortSessionRequest>; // PATCH

// Cohort list item
export interface Cohort {
  id: number;
  program: CohortProgramSummary;
  starts_on: string;
  ends_on: string;
  seat_capacity: number;
  seats_taken: number;
  seats_remaining: number;
  is_sold_out: boolean;
  is_nearly_full: boolean;
  is_enrollment_open: boolean;
  effective_price_usd: string;
  effective_price_ngn: string;
  facilitator_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Cohort detail — adds nested sessions array
export interface CohortDetail extends Cohort {
  sessions: CohortSession[];
}

export interface CreateCohortRequest {
  program: number; // program ID, not the nested object — confirmed by the request sample
  starts_on: string;
  ends_on: string;
  seat_capacity: number;
  price_override_usd: string;
  price_override_ngn: string;
  facilitator_name: string;
  is_active: boolean;
}

export type UpdateCohortRequest = CreateCohortRequest; // PUT
export type PatchCohortRequest = Partial<CreateCohortRequest>; // PATCH