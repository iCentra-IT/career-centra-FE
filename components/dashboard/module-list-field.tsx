"use client";

export interface ModuleFormValue {
  title: string;
  lessons: { title: string }[];
}

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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

interface ModuleListFieldProps {
  values: ModuleFormValue[];
  onChange: (values: ModuleFormValue[]) => void;
  error?: string;
}

// Nested version of TagListField/FaqListField — one card per module, each holding its own
// add/remove-able list of lesson titles.
export function ModuleListField({ values, onChange, error }: ModuleListFieldProps) {
  const updateModuleTitle = (index: number, title: string) => {
    const next = [...values];
    next[index] = { ...next[index], title };
    onChange(next);
  };

  const removeModule = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const addModule = () => {
    onChange([...values, { title: "", lessons: [] }]);
  };

  const updateLessonTitle = (moduleIndex: number, lessonIndex: number, title: string) => {
    const next = [...values];
    const lessons = [...next[moduleIndex].lessons];
    lessons[lessonIndex] = { title };
    next[moduleIndex] = { ...next[moduleIndex], lessons };
    onChange(next);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const next = [...values];
    next[moduleIndex] = {
      ...next[moduleIndex],
      lessons: next[moduleIndex].lessons.filter((_, i) => i !== lessonIndex),
    };
    onChange(next);
  };

  const addLesson = (moduleIndex: number) => {
    const next = [...values];
    next[moduleIndex] = {
      ...next[moduleIndex],
      lessons: [...next[moduleIndex].lessons, { title: "" }],
    };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-900">Course Modules</label>

      {values.map((courseModule, mi) => (
        <div key={mi} className="flex flex-col gap-3 rounded-md border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <input
              value={courseModule.title}
              onChange={(e) => updateModuleTitle(mi, e.target.value)}
              placeholder={`Module ${mi + 1} title`}
              className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
            <button
              type="button"
              onClick={() => removeModule(mi)}
              aria-label="Remove module"
              className="shrink-0 text-red-500 hover:text-red-600"
            >
              <TrashIcon />
            </button>
          </div>

          <div className="flex flex-col gap-2 pl-4">
            {courseModule.lessons.map((lesson, li) => (
              <div key={li} className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-gray-400">{li + 1}.</span>
                <input
                  value={lesson.title}
                  onChange={(e) => updateLessonTitle(mi, li, e.target.value)}
                  placeholder="Lesson title"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
                <button
                  type="button"
                  onClick={() => removeLesson(mi, li)}
                  aria-label="Remove lesson"
                  className="shrink-0 text-red-400 hover:text-red-600"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addLesson(mi)}
              className="flex items-center justify-center gap-2 rounded-md border border-dashed border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <PlusIcon />
              Add Lesson
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addModule}
        className="flex items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <PlusIcon />
        Add Module
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
