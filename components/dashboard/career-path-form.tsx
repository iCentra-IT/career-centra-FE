"use client";

import { useState } from "react";
import { usePrograms } from "@/hooks/queries/programs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagListField } from "@/components/dashboard/tag-list-field";
import type { CreateCareerPathRequest } from "@/types/career-paths";

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M6 7.5v4M10 7.5v4M4 4.5l.6 8a1 1 0 001 .9h4.8a1 1 0 001-.9l.6-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface CareerPathFormValues {
  title: string;
  description: string;
  levels: string[];
  certifications: string[];
  skills: string[];
  suitable_roles: string[];
  programIds: number[];
}

interface CareerPathFormProps {
  initialValues?: CareerPathFormValues;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: CreateCareerPathRequest) => void;
  onClose: () => void;
}

const EMPTY_VALUES: CareerPathFormValues = {
  title: "",
  description: "",
  levels: [],
  certifications: [],
  skills: [],
  suitable_roles: [],
  programIds: [],
};

export function CareerPathForm({
  initialValues,
  submitLabel,
  isPending,
  onSubmit,
  onClose,
}: CareerPathFormProps) {
  const { data: programs } = usePrograms();

  const [title, setTitle] = useState(initialValues?.title ?? EMPTY_VALUES.title);
  const [description, setDescription] = useState(initialValues?.description ?? EMPTY_VALUES.description);
  const [levels, setLevels] = useState(initialValues?.levels ?? EMPTY_VALUES.levels);
  const [certifications, setCertifications] = useState(
    initialValues?.certifications ?? EMPTY_VALUES.certifications,
  );
  const [skills, setSkills] = useState(initialValues?.skills ?? EMPTY_VALUES.skills);
  const [suitableRoles, setSuitableRoles] = useState(
    initialValues?.suitable_roles ?? EMPTY_VALUES.suitable_roles,
  );
  const [programIds, setProgramIds] = useState(initialValues?.programIds ?? EMPTY_VALUES.programIds);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedPrograms = (programs?.results ?? []).filter((p) => programIds.includes(p.id));

  const addProgram = (id: number) => {
    if (!programIds.includes(id)) setProgramIds([...programIds, id]);
  };

  const removeProgram = (id: number) => {
    setProgramIds(programIds.filter((pid) => pid !== id));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Career path name is required";
    if (programIds.length === 0) next.programs = "Add at least one program";
    if (levels.filter((v) => v.trim()).length === 0) next.levels = "Add at least one learning level";
    if (certifications.filter((v) => v.trim()).length === 0) next.certifications = "Add at least one certification";
    if (skills.filter((v) => v.trim()).length === 0) next.skills = "Add at least one skill";
    if (suitableRoles.filter((v) => v.trim()).length === 0) next.suitable_roles = "Add at least one suitable role";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      programs: programIds,
      levels: levels.map((v) => v.trim()).filter(Boolean),
      certifications: certifications.map((v) => v.trim()).filter(Boolean),
      skills: skills.map((v) => v.trim()).filter(Boolean),
      suitable_roles: suitableRoles.map((v) => v.trim()).filter(Boolean),
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Input
        label="Career Path Name"
        required
        placeholder="enter name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">Description</label>
        <textarea
          rows={4}
          maxLength={600}
          placeholder="Enter a brief description here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
        <p className="text-xs text-gray-400">Max Character: 600 words</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-900">
          Program <span className="text-secondary">*</span>
        </label>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) addProgram(Number(e.target.value));
          }}
          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        >
          <option value="">Select program</option>
          {(programs?.results ?? [])
            .filter((p) => !programIds.includes(p.id))
            .map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
        </select>

        {selectedPrograms.map((program) => (
          <div key={program.id} className="flex items-center justify-between px-1 py-1.5">
            <span className="text-sm text-gray-700">{program.title}</span>
            <button
              type="button"
              onClick={() => removeProgram(program.id)}
              aria-label="Remove program"
              className="shrink-0 text-red-500 hover:text-red-600"
            >
              <TrashIcon />
            </button>
          </div>
        ))}

        {errors.programs && <p className="text-xs text-red-500">{errors.programs}</p>}
      </div>

      <TagListField
        label="Learning Levels"
        addLabel="Add level"
        values={levels}
        onChange={setLevels}
        error={errors.levels}
      />
      <TagListField
        label="Certifications"
        addLabel="Add Certifications"
        values={certifications}
        onChange={setCertifications}
        error={errors.certifications}
      />
      <TagListField
        label="Skills You'll Gain"
        addLabel="Add skill"
        values={skills}
        onChange={setSkills}
        error={errors.skills}
      />
      <TagListField
        label="Suitable Roles"
        addLabel="Add role"
        values={suitableRoles}
        onChange={setSuitableRoles}
        error={errors.suitable_roles}
      />

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
        <Button type="submit" loading={isPending} className="w-auto px-6">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
