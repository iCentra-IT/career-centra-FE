// Shared multipart/form-data encoding for any endpoint that mixes a real file upload with nested
// array/object fields. Confirmed against the backend's nested-multipart parser (see programs):
// list indices are bracketed (`field[0]`), but a dict key nested inside is appended with no
// brackets around it (`field[0]key`, not `field[0][key]`) — e.g. modules[0]lessons[0]title for a
// field two levels deep. Recursing with that rule turns every leaf into its own form field, which
// the parser reassembles into nested lists/dicts.
export function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) return; // omit — e.g. a nullable field left unset on PATCH

  if (value instanceof File) {
    formData.append(key, value);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => appendFormValue(formData, `${key}[${index}]`, item));
  } else if (typeof value === "object") {
    for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
      appendFormValue(formData, `${key}${subKey}`, subValue);
    }
  } else {
    formData.append(key, String(value));
  }
}

export function toFormData<T extends object>(payload: T): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    appendFormValue(formData, key, value);
  }
  return formData;
}

// Content-Type: undefined removes apiClient's default "application/json" for this request so the
// browser can set "multipart/form-data; boundary=…" itself — a hardcoded multipart Content-Type
// here would be missing that boundary and produce a malformed request.
export const MULTIPART_HEADERS = { headers: { "Content-Type": undefined } };

// The backend accepts either encoding: plain JSON when there's no file to upload (confirmed by a
// real sample payload/response from the backend dev — a fileless program create sent as a normal
// JSON object with nested arrays/objects, no bracket-notation flattening needed), or multipart
// when a field is an actual File (confirmed separately by "not a file, check the encoding type on
// the form" when cover_image was JSON-encoded instead of a real upload). Picking JSON whenever
// possible avoids the bracket-notation encoding entirely for the common no-file-change case.
export function toRequestBody<T extends object>(
  payload: T,
): { body: T | FormData; headers?: Record<string, undefined> } {
  const hasFile = Object.values(payload).some((value) => value instanceof File);
  if (hasFile) return { body: toFormData(payload), headers: MULTIPART_HEADERS.headers };
  return { body: payload };
}
